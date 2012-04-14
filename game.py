import random

NUM_OF_GAME = 6
INIT_MONEY = 10
game_list = {}
game_no = {}

def create_game_list(cid):
    prob_list = [0.2] * (NUM_OF_GAME/2) + [0.8] * (NUM_OF_GAME/2)
    games = []
    for prob in prob_list:
        games.append(Game(prob, INIT_MONEY))
    game_list[cid] = games
    game_no[cid] = 0
    return games

def get_game_list(cid):
    if cid in game_list:
        return game_list[cid]
    else:
        return create_game_list(cid)

def get_current_no(cid):
    return game_no[cid]

def get_current_game(cid):
    current_games = get_game_list(cid)
    current_game_no = get_current_no(cid)
    return current_games[current_game_no]

def start_game(cid):
    current_game_list = get_game_list(cid)
    game_no[cid] += 1
    if game_no[cid] < NUM_OF_GAME:
        return True
    else:
        return False


class Game(object):
    TOTAL_ROUND = 15
    
    total = 0
    investment = 0
    probability = 0.2
    round_no = 0
    money = 0
    
    def __init__(self, probability, money):
        self.probability = probability
        self.money = money
    
    def input(self):
        invest = None
        while not invest:
            invest = int(raw_input("You got $%d, how much do you want to invest for:" % self.money))
            if invest > self.money:
                print "You only have $%d!"
                invest = None
        return invest
    
    def start(self):
        for round_no in range(self.TOTAL_ROUND):
            print "Round %d" % (round_no + 1)
            
            invest = self.input()
            returns = self.invest(invest)
            print "Got $%d, return $%d to you\n" % (self.investment * 4, returns)
            
    def invest(self, money):
        self.investment = int(money)
        return self.investment * 4 * self.is_return()
    
    def is_return(self):
        if random.random()<self.probability:
            return 0.5
        else:
            return 0
        
if __name__ == "__main__":
    game = Game(0.8, 10)
    game.start()