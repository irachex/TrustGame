var second_timer;
var t;

function array2json(arr) {
   var s="";
   if( arr instanceof Array || arr instanceof Object){
      var isObj=0;
      //check value type
      for(key in arr){
         if( isNaN(parseInt(key)) ){ //key is string
            isObj=1;
         }
         else{
            //key is index , check sort
            var na=arr.length;
            var tmp=arr;
            //hack for ie
            arr=Array();
            for(var j=0;j<na;j++){
               if( typeof(tmp[j])=="undefined" ){
                  arr[j]="";
               }
               else{
                  arr[j]=tmp[j];
               }
            }
         }
         break;
      }
      
      for(key in arr){
         var value=arr[key];
         if( isObj ){
            if(s){s+=',';}
            s+='"'+key+'":'+array2json(value);
         }
         else{
            if(s){s+=',';}
            s+=array2json(value);
         }
      }
      if(isObj)
         s='{'+s+'}';
      else
         s='['+s+']'
   }
   else{
      if(!isNaN(parseInt(arr))){
         s+=arr;
      }
      else{
         s='"'+arr+'"';
      }
   }
   return s;
}

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
        Timer.seconds -= 1; 
        $("#timer").html(Timer.seconds);
        if (Timer.seconds == 0) {
            window.clearInterval(second_timer);
            Game.hint("error", "Time up!");
            App.data[App.trial][App.round] = -1;
            Game.next()
            //App.newRound();
            return;
        }
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
        money = parseInt(money);
        var returns = money * (Math.random()*100 < Game.probability ? 2: 0);
        App.data[App.trial][App.round] = {
            invest: money,
            returns: returns,
            time: Timer.INIT_SECONDS - Timer.seconds
        };
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
        Game.disable();
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
    data: new Array(),
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
        App.data[App.trial] = new Array();
        $(".trial_no").html(App.trial).val(App.trial);
        if (App.test) {
            $(".trial_no").html("Test");
        }
        App.round = 0;
        App.newRound();
    },
    over: function() {
        $("#rest_info").html("正在提交数据...");
        $("#next_trial").hide();
        $.ajax({
            url: "/invest",
            type: "post",
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            data: array2json(App.data),
            success: function() {
                window.onbeforeunload = null;
                $("#rest_info").html("实验结束，感谢您的参与！");
            }
        });
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
        Survey.reset();
        if (App.img_list[App.trial - 1] == 0) {
            $("#photo_survey").hide();
           // $("#photo_survey input").val("-1");
        }
        else {
            $("#photo_survey").show();
        }
        $("#cross").hide();
        $("#game").hide();
        $("#survey").show();
    },
    reset: function() {
        $("#survey_error").hide().removeClass("disabled").removeAttr("disabled");
        $("#survey form .btn-group .btn").removeClass("active");
        $("input[name=trial_no]").val(App.trial);
        $("input[name=user_prob]").val("");
        $.each($("input", "form"), function() {
            this.checked = false;
        });
    },
    validate: function() {
        var flag = true;
        if ($("input[name=user_prob]").val() == "") flag = false;
        if ($("input[name=trial_no]").val() == "") flag = false;
        for (var i=1; i<=5; ++i) {
            if ($("input:radio[name=c"+i+"]:checked").val() == "") flag = false;
        }
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