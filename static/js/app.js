var second_timer;
var t;
Timer = {
    INIT_SECONDS: 8,
    seconds: 8,
    init: function() {
        Timer.seconds = Timer.INIT_SECONDS;
        $("#timer").html(Timer.seconds);
        Timer.start();
    },
    start: function() {
        second_timer = window.setInterval("Timer.display();", 1000);
    },
    display: function() {
        if (Timer.seconds == 0) {
            window.clearInterval(second_timer);
            Game.hint("error", "Time up!");
            Game.next()
            //App.newRound();
            return;
        }
        Timer.seconds -= 1; 
        $("#timer").html(Timer.seconds);
    }
};

Game = {
    probability: 0.8,
    image: 0,
    init: function(probability, image) {
        Game.probability = probability;
        Game.image = image;
        if (Game.image > 0) {
            $("#face").html("<img src='/static/face/" + Game.image + ".png' />");
        }
        Game.enable();
        $("#game").hide();
        $("#returns").hide();
        $("#cross").show();
        t = window.setTimeout(function() {
            window.clearInterval(t);
            if (Game.image == 0) {
                Game.start();
            }
            else {
                $("#face").show();
                $("#cross").hide();
                t = window.setTimeout(function() {
                    window.clearInterval(t);
                    Game.start();
                }, 3500);
            }
        }, 1000);
    },
    start: function() {
        $("#game").show();
        $("#face").hide();
        $("#cross").hide();
        Timer.init();  
    },
    hint: function(status, message) {
        if (status == "success") {
            $("#returns").removeClass("alert-error").addClass("alert-success");
        }
        else {
            $("#returns").removeClass("alert-success").addClass("alert-error");
        }
        $("#returns").html(message).show();
    },
    invest: function(money) {
        var returns = money * (Math.random()*100 < Game.probability ? 2: 0);
        window.clearInterval(second_timer);
        if (returns > 0) {
            Game.hint("success", "Invest $" + money + ", Return $" + returns);
        }
        else {
            Game.hint("error", "Invest $" + money + ", No return");
        }
        Game.next();
    },
    enable: function() {
        $("#money .btn").removeClass("disabled").removeAttr("disabled");
    },
    disable: function() {
        $("#money .btn").addClass("disabled").attr("disabled", "disabled");
    },
    next: function() {
        window.setTimeout(function() {
            App.newRound();
        }, 3500);
    }
};

App = {
    TOTAL_TRIAL: 6,
    trial: 0,
    TOTAL_ROUND: 15,
    round: 0,
    prob_list: new Array(),
    img_list: new Array(),
    init: function() {
        App.prob_list = eval("(" + $("#prob_list").html() + ")");
        App.img_list = eval("(" + $("#img_list").html() + ")");
        App.TOTAL_TRIAL = App.prob_list.length;
        $("#money .btn").click(function() {
            Game.disable();
            Game.invest($(this).html());
            return false;
        });
    },
    newRound: function() {
        if (App.round >= App.TOTAL_ROUND) {
            //window.location.href="/over"
            App.trialOver();
            return;
        }
        App.round += 1;
        $("#round_no").html(App.round);
        Game.init(App.prob_list[App.trial-1], App.img_list[App.trial-1]);
    },
    trialOver: function() {
        $("#survey").show();
        if (window.location.href.indexOf("test") !== -1) {
            // not test, show survey
        }
        else {
            // test
        }
        
    },
    newTrial: function() {
        if (App.trial >= App.TOTAL_TRIAL) {
            return;
        }
        App.trial += 1;
        $("trail_no").html(App.trial);
        App.round = 0;
        App.newRound();
    }
}

Survey = {
    init: function() {
        $('form .btn-group .btn').click(function() {
            
        });
        $("#cross").hide();
        $("#game").hide();
        $("#survey").show();        
    },
    submit: function() {
    }
}

$(document).ready(function() {
    //App.init();
    //App.newTrial();
    Survey.init();
});