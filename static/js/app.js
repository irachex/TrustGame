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
        $("#survey").hide();
        $("#rest").hide();
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
        $("#returns").html(message).fadeIn(300);
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
    test: false,
    init: function() {
        if (window.location.href.indexOf("test") !== -1) {
            App.test = true;
        }
        else {
            App.test = false;
        }
        App.prob_list = eval("(" + $("#prob_list").html() + ")");
        App.img_list = eval("(" + $("#img_list").html() + ")");
        App.TOTAL_TRIAL = App.prob_list.length;
        $("#money .btn").click(function() {
            Game.disable();
            Game.invest($(this).html());
            return false;
        });
        $("#next_trial").click(function() {
            App.newTrial();
        });
    },
    newRound: function() {
        if (App.round >= App.TOTAL_ROUND) {
            //window.location.href="/over"
            App.trialOver();
            return;
        }
        App.round += 1;
        $(".round_no").html(App.round);
        Game.init(App.prob_list[App.trial-1], App.img_list[App.trial-1]);
    },
    trialOver: function() {
        if (!App.test) {
            // not test, show survey
            $(".round_no").html(" Over. Please fill the survey");
            Survey.init();
        }
        else {
            // test
            $(".round_no").html(" Over.");
            $("#rest_info").html("Trial Test is over. Please have a rest and move to formal trial : )");
            $("#next_trial").html("Start formal trial").attr("href", "/game");
            $("#game").hide();
            $("#rest").show();
            window.onbeforeunload = null;
        }
    },
    newTrial: function() {
        if (App.trial >= App.TOTAL_TRIAL) {
            return;
        }
        App.trial += 1;
        $(".trial_no").html(App.trial).val(App.trial);
        if (App.test) {
            $(".trial_no").html("Test");
        }
        App.round = 0;
        App.newRound();
    },
    over: function() {
        window.onbeforeunload = null;
        $("#rest_info").html("实验结束，感谢您的参与！");
        $("#next_trial").html("");
    }
}

Survey = {
    init: function() {
        $('#survey form .btn-group .btn').click(function() {
            var percent = $(this).html();
            var value = percent.substr(0, percent.length-1);
            $("#user_prob").val(value);
        });
        $("#survey form").submit(function() {
            if (Survey.validate()) {
                $("#survey_error").addClass("disabled").attr("disabled", "")
                Survey.submit();
            }
            else {
                $("#survey_error").fadeIn();
            }
            return false;
        });
        if (App.img_list[App.trial] == 0) {
            $("#photo_survey").hide();
        }
        else {
            $("#photo_survey").show();
        }
        $("#survey_error").hide().removeClass("disabled").removeAttr("disabled");
        $("#survey form input").val("");
        $("#survey form .btn-group .btn").removeClass("active");
        $("#cross").hide();
        $("#game").hide();
        $("#survey").show();
    },
    validate: function() {
        var flag = true;
        $.each($("input", "form"), function() {
            if ($(this).val() == "") flag=false;
        });
        return flag;
    },
    submit: function() {
        $.ajax({
            url: '/survey',
            type: 'POST',
            data: $("#survey form").serialize(),
            success: function() {
                $("#survey").hide();
                $(".round_no").html(" Over.");
                $("#rest").show();
                if (App.trial == App.TOTAL_TRIAL) {
                    App.over();
                }
            }
        });
    }
}

$(document).ready(function() {
    App.init();
    App.newTrial();
});

window.onbeforeunload = function() {
    return "实验还未完成，离开页面将丢失本次试验数据，是否继续？";
}