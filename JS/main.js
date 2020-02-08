$(document).ready(function () {
    //初始化firebase数据库
    var db = firebase.firestore();

    //默认用户全名和昵称
    var userNewName = "Kageyama Tobio";
    var userNickName = "コート上の王様";

    //现在的时间
    var currentTime = new Date()
    var month = currentTime.getMonth() + 1
    var day = currentTime.getDate()

    //用户登陆成功：写入用户的姓名和邮箱到firebase
    firebase.auth().onAuthStateChanged(function (user) {
        db.collection("user")
            .doc(user.uid)
            .set({
                "name": user.displayName,
                "email": user.email,
            }, {
                merge: true
            });

        //用户登陆成功：读取之前的数据
        db.collection("user").doc(user.uid).collection("Tweet").orderBy("Date", "desc")
            .get()
            .then(function (snap) {
                snap.forEach(function (doc) { //iterate thru collection
                    var oldtweetContent = doc.data().Content;
                    var oldDate = doc.data().Date;

                    var oldUserName = $("<p class=current-user-name><span class=user-post-name>" + userNewName + "</span><span class=user-post-nickname>@" + userNickName + "</span><span class=user-post-time>" + oldDate + "</span></p>");
                    //存储用户推文内容
                    var oldPostText = $("<p class=current-user-post>" + oldtweetContent + "</p>");

                    //创建元素
                    var post = $("#post-container");
                    var userPost = $("<div class=user-post></div>");
                    var userPostWrap = $("<div class=user-post-wrap></div>");
                    var userImg = $("<img class=current-user src=Resource/user.jpg>");
                    var userPostContent = $("<div class=user-post-content></div>");
                    var userImgWrap = $("<div class=user-img-wrap>");
                    var userPostImg = $("<img class=user-post-img src=Resource/post-img.jpg>");
                    var userTweet = $("<div class=user-tweet>");
                    var commentIcon = $("<img class=user-post-sc src=Resource/comment.png>");
                    var retweetIcon = $("<img class=user-post-sc src=Resource/retweet.png>");
                    var likeIcon = $("<img class=user-post-sc src=Resource/like.png>");
                    var uploadIcon = $("<img class=user-post-sc src=Resource/upload.png>");

                    //加入新的推文 
                    $(userPostContent).append(oldUserName, oldPostText);
                    $(userPostWrap).append(userImg, userPostContent);
                    $(userImgWrap).append(userPostImg);
                    $(userTweet).append(commentIcon, retweetIcon, likeIcon, uploadIcon);
                    $(userPost).append(userPostWrap, userImgWrap, userTweet);
                    $(post).prepend(userPost);
                });
            });
    });

    //发布新的推文
    function newPost() {
        $("#post-btn").click(function () {
            var userName = $("<p class=current-user-name><span class=user-post-name>" + userNewName + "</span><span class=user-post-nickname>@" + userNickName + "</span><span class=user-post-time>" + month + "月" + day + "日" + "</span></p>");
            //用户推文数据
            var tweetContent = $("#user-input").val();
            //存储用户推文内容
            var postText = $("<p class=current-user-post>" + tweetContent + "</p>");

            //如果发布内容为空，提示需要输入内容
            if (tweetContent == '') {
                alert('wtf');
            } else {
                //存储推文相关的元素
                //用户姓名，昵称，发文日期
                var post = $("#post-container");
                var userPost = $("<div class=user-post></div>");
                var userPostWrap = $("<div class=user-post-wrap></div>");
                var userImg = $("<img class=current-user src=Resource/user.jpg>");
                var userPostContent = $("<div class=user-post-content></div>");
                var userImgWrap = $("<div class=user-img-wrap>");
                var userPostImg = $("<img class=user-post-img src=Resource/post-img.jpg>");
                var userTweet = $("<div class=user-tweet>");
                var commentIcon = $("<img class=user-post-sc src=Resource/comment.png>");
                var retweetIcon = $("<img class=user-post-sc src=Resource/retweet.png>");
                var likeIcon = $("<img class=user-post-sc src=Resource/like.png>");
                var uploadIcon = $("<img class=user-post-sc src=Resource/upload.png>");

                //加入新的推文 
                $(userPostContent).append(userName, postText);
                $(userPostWrap).append(userImg, userPostContent);
                $(userImgWrap).append(userPostImg);
                $(userTweet).append(commentIcon, retweetIcon, likeIcon, uploadIcon);
                $(userPost).append(userPostWrap, userImgWrap, userTweet);
                $(post).prepend(userPost);
                console.log(userNickName, userName);

                //清空input数据
                $('input[type="text"], textarea').val('');

                //写入tweet内容到firebase
                function writeTweetEvent() {
                    var docData = {
                        Content: tweetContent,
                        Date: month + "月" + day + "日"
                    };

                    //写入到用户uid中
                    firebase.auth().onAuthStateChanged(function (user) {
                        db.collection("user").doc(user.uid).collection("Tweet").add(docData);
                    });
                };
                writeTweetEvent();
            }
        });
    }
    newPost();

    function userProfileControl() {
        //打开用户个人资料页面
        $("#user-profile, #personal-info").click(function () {
            $(".user-profile-container").fadeIn();
        });

        //关闭用户个人资料页面
        $("#save-profile-btn").click(function () {
            $(".user-profile-container").fadeOut();
            changeUserInfo();
        });
    }
    userProfileControl();

    //更改用户信息
    function changeUserInfo() {
        userNewName = $("#user-name-input").val();
        userNickName = $("#user-nickname-input").val();
    }

    function navBarAnimation() {
        $(".nav-bar-item-wrap").mouseenter(function() {
            $(this).css("color", "rgb(29, 161, 242)");
            $(this).find("i").css("color", "rgb(29, 161, 242)");
            $(this).css("background-color", "rgb(245,248,250)");
            $(this).css("border-radius", "25px");
            $(this).css("transition", "all 0.5s");
            $(this).find("i").css("transition", "all 0.5s");
        });

        $(".nav-bar-item-wrap").mouseleave(function() {
            $(this).css("color", "black");
            $(this).find("i").css("color", "black");
            $(this).css("background-color", "rgba(245,248,250,0)");
            $(this).css("border-radius", "25px");
  
        });
    }

    navBarAnimation();
});