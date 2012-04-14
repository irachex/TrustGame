#!/usr/bin/env python26
# coding: utf-8

import os
import time
import uuid
import web

import game

urls = (
    r"/game/(.*)", "GameHandler",
    r"/over", "OverHandler",
    r"/invest/(\d*)", "InvestHandler",
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


class GameHandler(BaseHandler):
    def start_game(self):
        cid = self.get_client_id()
        print cid
        return game.start_game(cid)

    def get_current_game(self):
        cid = self.get_client_id()
        current_game = game.get_current_game(cid)
        return current_game
    
    def get_current_no(self):
        cid = self.get_client_id()
        current_no = game.get_current_no(cid)
        return current_no
    
    def GET(self, opration):
        if not opration:
            opration = "new"
        if opration == "test":
            return render.game(no="Test", money=game.INIT_MONEY, img=None)
        if opration == "restart":
            self.clear_cookie()
        if self.start_game():
            no = self.get_current_no()
            return render.game(no=no, money=game.INIT_MONEY, img="1.png")
        else:
            web.seeother("/over")


class InvestHandler(GameHandler):
    
    def GET(self, money):
        referer = web.ctx.env.get('HTTP_REFERER')
        if not (referer and referer.endswith("test")):
            pass
        money = int(money)
        if money > game.INIT_MONEY:
            return '{"ok":"false", "msg":"You don\'t have that much!"}'
        current_game = self.get_current_game()
        returns = current_game.invest(money)
        return '{"ok":"true", "msg":"' + str(returns) + '"}'


class OverHandler(GameHandler):
    def GET(self):
        return render.over()


rootdir = getPath()
render = web.template.render(rootdir + "/templates")

#web.webapi.internalerror = web.debugerror 

app = web.application(urls, globals())
#main = app.wsgifunc()


if __name__ == "__main__":
    app.run()