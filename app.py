#!/usr/bin/env python
# coding: utf-8

import os
import time
import uuid
import random
import json
import web

import config

urls = (
    r"/info", "InfoHandler",
    r"/about", "AboutHandler",
    r"/game", "GameHandler",
    r"/test", "TestHandler",
    r"/invest", "InvestHandler",
    r"/survey", "SurveyHandler",
    r"/report(.*)", "ReportHandler",
    r"/", "HomeHandler",
)

def getPath():
    return os.path.dirname(__file__)


class BaseHandler(object):
    def __init__(self):
        pass
         
    def set_cookie(self, key, value):
        web.setcookie(key, value, 360000)
    
    def get_cookie(self, key, default=None):
        return web.cookies().get(key, default)
    
    def clear_cookie(self):
        self.set_cookie("cid", "")
    
    def get_uid(self):
        uid = self.get_cookie("uid")
        if not uid:
            return None
        return int(uid)
    
    def is_finished(self):
        pass
        
    def get_client_id(self):
        cid = self.get_cookie("cid")
        if cid:
            return cid
        else:
            cid = uuid.uuid4()
            self.set_cookie("cid", cid)
        return cid


class NeedInfoHandler(BaseHandler):
    def __init__(self):
        if not self.get_uid():
            web.seeother("/info")
            return
            
    
class HomeHandler(BaseHandler):
    def GET(self):
        #return render.index()
        web.seeother("/info")


class AboutHandler(BaseHandler):
    def GET(self):
        return render.about()


class InfoHandler(BaseHandler):
    def GET(self):
        return render.info(msg=None)
    
    def POST(self):
        age = web.input().get("age")
        gender = web.input().get("gender")
        if not age or not gender:
            return render.info(msg="Please complete the form.")
        uid = db.insert('user', gender=gender, age=age)
        self.set_cookie("uid", uid)
        return "<html><script type='text/javascript'>window.location.href='/about';</script></html>"


class GameHandler(NeedInfoHandler):
    def GET(self):
        uid = self.get_uid()
        if not uid or db.query("select count(*) as cnt from user where id=%d" % uid)[0].cnt == 0:
            web.seeother("/info")
            return
        if db.query("select count(*) as cnt from game where id='%d-6-15'" % uid)[0].cnt:
            web.seeother("/info")
        face_list = [(80, 1), (20, 2), (80, 3), (80, 4)]
        noface_list = [(80, 0), (20, 0)]
        random.shuffle(face_list)
        random.shuffle(noface_list)        
        game_list = noface_list + face_list
        prob_list = [p for (p, i) in game_list]
        img_list = [i for (p, i) in game_list]
        for i in range(len(prob_list)):
            trial_no = i + 1
            id = str(uid) + "-" + str(trial_no)
            if not db.query("select count(*) as cnt from trial where id='%s'" % id)[0].cnt:
                db.insert('trial', id=id, uid=uid, trial_no=trial_no, probability=prob_list[i], image=img_list[i])
            else:
                db.update('trial', where="id='%s'" % id, uid=uid, trial_no=trial_no, probability=prob_list[i], image=img_list[i])
        return render.game(str(prob_list), str(img_list))


class TestHandler(NeedInfoHandler):
    def GET(self):
        return render.game(str([50,]), str([0,]))
    
    
class InvestHandler(NeedInfoHandler):
    def POST(self):
        referer = web.ctx.env.get('HTTP_REFERER')
        if referer and referer.endswith("test"):
            return
        data = web.data()
        print data
        jsondata = json.loads(data)
        print jsondata
        uid = self.get_uid()
        for trial_no in range(1, len(jsondata)):
            for round_no in range(1, len(jsondata[trial_no])):
                print trial_no, round_no
                if jsondata[trial_no][round_no] == -1:
                    invest = -1
                    returns = -1
                    time = -1
                else:
                    invest = jsondata[trial_no][round_no]["invest"]
                    returns = jsondata[trial_no][round_no]["returns"]
                    time = jsondata[trial_no][round_no]["time"]
                id = str(uid) + "-" + str(trial_no) + "-" + str(round_no)
                if not db.query("select count(*) as cnt from game where id='%s'" % id)[0].cnt:
                    db.insert("game", id=id, uid=uid, trial_no=trial_no, round_no=round_no, invest=invest, returns=returns, time=time)
                else:
                    db.update("game", where="id='%s'" % id, id=id, uid=uid, trial_no=trial_no, round_no=round_no, invest=invest, returns=returns, time=time)
        return '{"ok":"true"}'


class SurveyHandler(NeedInfoHandler):
    def POST(self):
        uid = self.get_uid()
        trial_no = int(web.input().get("trial_no", None))
        user_prob = int(web.input().get("user_prob", None))
        c1 = int(web.input().get("c1", -1))
        c2 = int(web.input().get("c2", -1))
        c3 = int(web.input().get("c3", -1))
        c4 = int(web.input().get("c4", -1))
        c5 = int(web.input().get("c5", -1))
        id = str(uid) + "-" + str(trial_no)
        db.update('trial', where="id='%s'" % id, user_prob=user_prob, c1=c1, c2=c2, c3=c3, c4=c4, c5=c5)
        return "ok"


class ReportHandler(object):
    def GET(self, action):
        user_list = db.select("user", order="id")
        trial_list = db.select("trial", order="uid, trial_no")
        #game_list = db.select("game", order="uid, trial_no, round_no")
        game_list = db.query("select * from game where uid in (select uid from game where id like '%-6-15')")
        user = dict()
        trial = dict()
        for item in user_list:
            user[item.id] = item 
        for item in trial_list:
            trial[item.id] = item
        if action=="/download":
            web.header("Content-type", "text/csv;charset=gbk")
            web.header("Content-Disposition", 'attachment; filename="TrustGameData.csv"')
            content = u'"被试", "性别", "年龄", "时间", "组", "照片编号", "可能性", "用户评价", "可信度", "吸引力", "竞争力", "攻击性", "令人喜爱程度", "回合", "投资", "回报", "花费时间",\r\n'
            for item in game_list:
                tid = "%d-%d" % (item.uid, item.trial_no)
                content += u'"%d", "%s", "%s", "%s", "%d", "%d", "%d", "%d", "%d", "%d", "%d", "%d", "%d", "%d", "%d", "%d", "%s",\r\n' \
                % (item.uid, user[item.uid].gender, user[item.uid].age, user[item.uid].created, item.trial_no, trial[tid].image, trial[tid].probability, trial[tid].user_prob, trial[tid].c1, trial[tid].c2, trial[tid].c3, trial[tid].c4, trial[tid].c5, item.round_no, item.invest, item.returns, item.time)
            return content.encode("gbk")
        return render.report(user=user, trial=trial, game_list=game_list)


rootdir = getPath()
render = web.template.render(rootdir + "/templates")
db = web.database(dbn=config.db["engine"], db=config.db["name"])

#web.webapi.internalerror = web.debugerror 

app = web.application(urls, globals())

application = app.wsgifunc()

if __name__ == "__main__":
    app.run()
