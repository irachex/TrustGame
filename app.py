#!/usr/bin/env python26
# coding: utf-8

import os
import time
import uuid
import random
import web

urls = (
    r"/game", "GameHandler",
    r"/test", "TestHandler",
    r"/invest", "InvestHandler",
    r"/", "HomeHandler",
)

def getPath():
    return os.path.dirname(__file__)


class BaseHandler(object):
    def __init__(self):
        pass
         
    def set_cookie(self, key, value):
        web.setcookie(key, value, 360000)
    
    def get_cookie(self, key):
        return web.cookies().get(key)
    
    def clear_cookie(self):
        self.set_cookie("cid", "")
        
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

class InfoHandler(BaserHandler):
    def GET(self):
        return render.info()
    
    def POST(self):
        pass
    
class GameHandler(BaseHandler):
    def GET(self):
        prob_list = [20] * 3 + [80] * 3
        random.shuffle(prob_list)
        print prob_list
        return render.game(str(prob_list))

class TestHandler(GameHandler):
    def GET(self):
        prob_list = random.sample([0.2, 0.8], 1)
        return render.game(str(prob_list))
    
class InvestHandler(GameHandler):
    def GET(self):
        referer = web.ctx.env.get('HTTP_REFERER')
        if referer and referer.endswith("test"):
            return
        money = int(web.input().get("money"))
        round_no = int(web.input().get("round_no"))
        trial_no = money = int(web.input().get("trial_no"))
        print money, round_no, trial_no


rootdir = getPath()
render = web.template.render(rootdir + "/templates")

#web.webapi.internalerror = web.debugerror 

app = web.application(urls, globals())
#main = app.wsgifunc()


if __name__ == "__main__":
    app.run()