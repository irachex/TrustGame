#!/usr/bin/env python26
# coding: utf-8

import os
import time
import uuid
import random
import web

urls = (
    r"/info", "InfoHandler",
    r"/about", "AboutHandler",
    r"/game", "GameHandler",
    r"/test", "TestHandler",
    r"/invest", "InvestHandler",
    r"/survey", "SurveyHandler",
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
        return int(self.get_cookie("uid"))
        
    def get_client_id(self):
        cid = self.get_cookie("cid")
        if cid:
            return cid
        else:
            cid = uuid.uuid4()
            self.set_cookie("cid", cid)
        return cid
    
class HomeHandler(BaseHandler):
    def GET(self):
        return render.index()

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
        return "<html><script type='text/javascript'>window.location.href='/game';</script></html>"

class GameHandler(BaseHandler):
    def GET(self):
        prob_list = [20] * 3 + [80] * 3
        img_list = [1, 2, 3, 4]
        random.shuffle(prob_list)
        random.shuffle(img_list)
        img_list += [0, 0]
        uid = self.get_uid()
        for i in range(len(prob_list)):
            db.insert('trial', uid=uid, trial_no=i+1, probability=prob_list[i], image=img_list[i])
        return render.game(str(prob_list), str(img_list))

class TestHandler(GameHandler):
    def GET(self):
        prob_list = random.sample([0.2, 0.8], 1)
        return render.game(str(prob_list), str([0]))
    
class InvestHandler(GameHandler):
    def GET(self):
        referer = web.ctx.env.get('HTTP_REFERER')
        if referer and referer.endswith("test"):
            return
        uid = self.get_uid()
        money = int(web.input().get("money"))
        returns = int(web.input().get("returns"))
        trial_no = int(web.input().get("trial_no"))
        round_no = int(web.input().get("round_no"))
        db.insert("game", uid=uid, trial_no=trial_no, round_no=round_no, money=money, returns=returns)
        return "ok"

class SurveyHandler(BaseHandler):
    def POST(self):
        uid = self.get_uid()
        trial_no = int(web.input().get("trial_no", None))
        user_prob = int(web.input().get("user_prob", None))
        c1 = int(web.input().get("c1", None))
        c2 = int(web.input().get("c2", None))
        c3 = int(web.input().get("c3", None))
        c4 = int(web.input().get("c1", None))
        c5 = int(web.input().get("c1", None))
        db.update('trial', where='uid=%d and trial_no=%d' % (uid, trial_no),
            user_prob=user_prob, c1=c1, c2=c2, c3=c3, c4=c4, c5=c5)
        return "ok"


class ReportHandler(BaseHandler):
    def GET(self, action):
        user = db.query("user", order="uid")
        trial = db.query("trial", order="uid, trial_no")
        game = db.query("game", order="uid, trial_no, round_no")
        if action=="download":
            
            return
        return render.report(user=user, trial=trial, game=game)


rootdir = getPath()
render = web.template.render(rootdir + "/templates")
db = web.database(dbn='sqlite', db='trust.db')

#web.webapi.internalerror = web.debugerror 

app = web.application(urls, globals())
#main = app.wsgifunc()


if __name__ == "__main__":
    app.run()