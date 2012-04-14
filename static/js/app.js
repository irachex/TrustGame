var second_timer;
var t;
Timer = {
    INIT_SECONDS: 15,
    seconds: 15,
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
    init: function(probability) {
        Game.probability = probability;
        Game.enable();
        $("#game").hide();
        $("#cross").show();
        t = window.setTimeout(function() {
            window.clearInterval(t);
            $("#game").show();
            $("#cross").hide();
            Timer.init();
        }, 1000);
        $("#returns").hide();
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
    }
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
    init: function() {
        App.prob_list = eval("(" + $("#data").html() + ")");
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
        Game.init(0.8);
    },
    trialOver: function() {
        
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

$(document).ready(function() {
    App.init();
    App.newTrial();
});