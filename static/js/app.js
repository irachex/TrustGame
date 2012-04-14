var second_timer;
var round_timer;
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
            App.new();
            return;
        }
        Timer.seconds -= 1; 
        $("#timer").html(Timer.seconds);
    }
};

Game = {
    init: function() {
        $("#game").hide();
        //$("#game").delay(1000).show();
        $("#cross").show();
        t = window.setTimeout(function() {
            window.clearInterval(t);
            $("#game").show();
            $("#cross").hide();
            $("#money").val("").focus();
            Timer.init();
        }, 1000);
        $("#returns").hide();
    },
    
    invest: function(money) {
        
        $.get("/invest/" + money, function(content) {
            data = eval("(" + content + ")");
            if (data.ok == "true") {
                window.clearInterval(second_timer);
                if (data.msg != "0") {
                    $("#returns").removeClass("alert-error").addClass("alert-success");
                    $("#returns").html("Returns $" + data.msg).show();
                }
                else {
                    $("#returns").removeClass("alert-success").addClass("alert-error");
                    $("#returns").html("No returns").show();
                }
                window.setTimeout(function() {
                    App.new();
                }, 3500);
            }
            else {
                $("#returns").removeClass("alert-success")
                             .addClass("alert-error")
                             .html(data.msg)
                             .show();
            }
        });
    }
};

App = {
    TOTAL_ROUND: 15,
    round: 0,
    init: function() {
        $(".money").click(function() {
            Game.invest($(this).html());
            return false;
        });
    },
    new: function() {
        if (App.round >= App.TOTAL_ROUND) {
            window.location.href="/over"
        }
        App.round += 1;
        $("#round_no").html(App.round);
        Game.init();
    }
}
$(document).ready(function() {
    App.init();
    App.new();
});