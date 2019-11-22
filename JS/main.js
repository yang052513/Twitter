$(document).ready(function () {
    //默认用户全名和昵称
    var userNewName = "Kageyama Tobio";
    var userNickName = "コート上の王様";

    // 发布新的推文
    $("#post-btn").click(function () {
        //用户推文数据
        var tweetContent = $("#user-input").val();

        //用户姓名，昵称，发文日期
        var userName = $("<p class=current-user-name><span class=user-post-name>" + userNewName + "</span><span class=user-post-nickname>@" + userNickName + "</span><span class=user-post-time>11月20日</span></p>");
        //存储用户推文内容
        var postText = $("<p class=current-user-post>" + tweetContent + "</p>");

        //存储推文相关的元素
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
        $(post).prepend(userPostWrap, userImgWrap, userTweet, userPost);
        console.log(userNickName, userName);
    });

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

});