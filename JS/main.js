$(document).ready(function () {
    //初始化firebase数据库
    var db = firebase.firestore();
    var storageRef = firebase.storage().ref();
    var tag = [];
    //用户上传照片功能
    // firebase.auth().onAuthStateChanged(function (user) {
    //     $("#upload-image").click(function () {
    //         var ref = firebase.storage().ref();
    //         var file = $("#image-input").prop('files')[0];

    //         var metadata = {
    //             contentType: file.type,
    //         };

    //         var name = new Date() + '-' + file.name;

    //         var task = ref.child(name).put(file, metadata);

    //         task.then(snapshot => snapshot.ref.getDownloadURL())
    //             .then(url => {
    //                 console.log("图像上传成功 链接为: " + url);;
    //                 // const imageelement = document.createElement("image");
    //                 // imageelement.src = url;


    //             })
    //     });
    // });

    //用户发送信息时间 Get the current time
    var today = new Date();
    var month = today.getMonth();
    var day = today.getDate();
    var hour = today.getHours();
    var minute = today.getMinutes();
    var second = today.getSeconds();

    //样式化时间格式 2020-09-02 08:02:01 Style time format
    //If less than 10, add 0 before
    if (month < 10) {
        month = '0' + (month + 1);
    }

    if (day < 10) {
        day = '0' + day;
    }

    if (hour < 10) {
        hour = '0' + hour;
    }

    if (minute < 10) {
        minute = '0' + minute;
    }

    if (second < 10) {
        second = '0' + second;
    }

    var date = today.getFullYear() + '-' + month + '-' + day;
    var time = hour + ":" + minute + ":" + second;
    var dateTime = date + ' ' + time;


    //用户登陆成功：写入用户的姓名和邮箱到firebase
    firebase.auth().onAuthStateChanged(function (user) {
        db.collection("user")
            .doc(user.uid)
            .set({
                "email": user.email,
                "name": user.displayName,
            }, {
                merge: true
            });

        //用户登陆成功：读取之前的数据
        db.collection("tweet").orderBy("Date", "asc").onSnapshot(function (snap) {
            snap.docChanges().forEach(function (change) { //iterate thru collection
                var tweet_content = change.doc.data().Content;
                var tweet_date = change.doc.data().Date;
                var tweet_image = change.doc.data().Image;
                var tweet_username = change.doc.data().Name;
                var tweet_usernickname = change.doc.data().Nickname;
                var tweet_userProfile = change.doc.data().Profile;
                var tweet_likecnt = change.doc.data().Like;
                var tweet_like;

                if (tweet_likecnt == 0) {
                    tweet_like = $("<div class=tweet-like>" +
                        "<i class='like-gray far fa-heart'></i>" +
                        "<span class=like-count></span>" +
                        "</div>");
                } else {
                    tweet_like = $("<div class=tweet-like>" +
                        "<i class='like-color fas fa-heart'></i>" +
                        "<span class=like-count>" + tweet_likecnt + "</span>" +
                        "</div>");
                }

                var tweet_tag;
                var tweet_tag_wrap = $("<div class=tweet-tag-wrap></div>");
                if (change.doc.data().Tag != null) {
                    for (var i = 0; i < change.doc.data().Tag.length; i++) {
                        tweet_tag = $("<button class=tweet-tag>" + change.doc.data().Tag[i] + "</button>");
                        tweet_tag_wrap.append(tweet_tag);
                    }
                }

                if (tweet_image == null) {
                    var user_post = $("<div class=user-post id=" + change.doc.id + ">" +
                        "<div class=user-post-wrap>" +
                        "<img class=current-user src=" + tweet_userProfile + ">" +
                        "<div class=user-post-content>" +
                        "<p class=current-user-name>" +
                        "<span class=user-post-name>" + tweet_username + "</span>" +
                        "<span class=user-post-nickname>@" + tweet_usernickname + "</span>" +
                        "<span class=user-post-time>" + tweet_date + "</span>" +
                        "</p>" +
                        "<p class=current-user-post>" + tweet_content + "</p>" +
                        "</div>"
                    );
                    user_post.append(tweet_tag_wrap, tweet_like);


                } else {
                    var user_post = $("<div class=user-post id=" + change.doc.id + ">" +
                        "<div class=user-post-wrap>" +
                        "<img class=current-user src=" + tweet_userProfile + ">" +
                        "<div class=user-post-content>" +
                        "<p class=current-user-name>" +
                        "<span class=user-post-name>" + tweet_username + "</span>" +
                        "<span class=user-post-nickname>@" + tweet_usernickname + "</span>" +
                        "<span class=user-post-time>" + tweet_date + "</span>" +
                        "</p>" +
                        "<p class=current-user-post>" + tweet_content + "</p>" +
                        "<div class=tweet-tag-wrap></div>" +
                        "</div>" +
                        "</div>" +
                        "<div class=user-img-wrap>" +
                        "<img class=user-post-img src=" + tweet_image + ">" +
                        "</div>"
                    );
                    user_post.append(tweet_tag_wrap, tweet_like);
                }

                //加入新的推文 
                if (change.type == "added") {
                    $("#post-container").prepend(user_post);
                } else if (change.type == "modified") {
                    $("#" + change.doc.id).find(".like-count").html(tweet_likecnt);
                }
            });
        });
    });

    firebase.auth().onAuthStateChanged(function (user) {
        //发布新的推文 信息写入到云端
        $("#tag-input").keyup(function (event) {
            var tagMsg = $("#tag-input").val();

            if (event.keyCode == 13 && tagMsg != '') {
                tag.push(tagMsg);
                $(".tag-placeholder").append("<button class=tweet-tag>" + tagMsg + "</div>");
                $('input[type="text"]').val('');

                var tagDoc = {
                    TagName: tagMsg,
                };

                db.collection("tag").add(tagDoc);
                console.log(tag);
            }
        });

        $("#post-btn").click(function () {
            db.collection("user").doc(user.uid).onSnapshot(function (snap) {
                //用户推文数据
                var user_name;
                var tweetContent = $("#user-input").val();
                var file = $("#image-input").prop('files')[0];

                if (snap.data().name == null) {
                    user_name = user.displayName;
                } else {
                    user_name = snap.data().name;
                }

                if (snap.data().nickname == null) {
                    user_nickname = "コート上の王様";
                } else {
                    user_nickname = snap.data().nickname;
                }

                if (snap.data().profile == null) {
                    user_profile = "Resource/user.jpg";
                } else {
                    user_profile = snap.data().profile;
                }

                //如果发布内容为空，提示需要输入内容
                if (tweetContent == '') {
                    $("#zero-msg-modal").fadeIn();
                    //用户上传图片并且编写信息
                } else if (file != null && tweetContent != '') {
                    //存储照片上传的信息
                    console.log(file);
                    var metadata = {
                        contentType: file.type,
                    };
                    var file_name = dateTime + '-' + file.name;
                    var task = storageRef.child(file_name).put(file, metadata);

                    //写入tweet内容到firebase
                    task.then(snapshot => snapshot.ref.getDownloadURL())
                        .then(url => {
                            console.log("图像上传成功 链接为: " + url);
                            var tweetData = {
                                Content: tweetContent,
                                Date: dateTime,
                                Image: url,
                                Name: user_name,
                                Nickname: user_nickname,
                                Profile: user_profile,
                                Tag: tag,
                                Like: parseInt(0),
                            };
                            db.collection("tweet").add(tweetData);
                            tag = [];
                        })
                    $('input[type="text"], input[type="file"], textarea').val('');
                    $(".tag-placeholder").empty();
                    //用户选择只上传信息 没有图片
                } else if (file == null && tweetContent != '') {
                    var tweetData = {
                        Content: tweetContent,
                        Date: dateTime,
                        Name: user_name,
                        Nickname: user_nickname,
                        Profile: user_profile,
                        Tag: tag,
                        Like: parseInt(0),
                    };
                    db.collection("tweet").add(tweetData);
                    tag = [];
                    $('input[type="text"], input[type="file"], textarea').val('');
                    $(".tag-placeholder").empty();
                }
            });
            console.log(tag);
        });


        db.collection("user").doc(user.uid).onSnapshot(function (snap) {
            //更改本地所有用户头像
            $("#user-profile, #user-profile-top, #change-profile-pic").attr("src", snap.data().profile);
            $(".user-name").html(snap.data().name);
        });

        //打开用户个人资料页面
        $("#user-profile, #personal-info").click(function () {
            $(".user-profile-container").fadeIn();
        });

        $("#change-profile-pic").hover(function () {
            $("#change-profile-icon").fadeIn();
            $("#change-profile-pic").css("opacity", "0.5");
        });

        $("#exit-profile-header").click(function () {
            $(".user-profile-container").fadeOut();
        });

        //用户信息更新成功 关闭用户个人资料页面
        $("#save-profile-btn").click(function () {
            $(".user-profile-container").fadeOut();
            userNewName = $("#user-name-input").val();
            userNickName = $("#user-nickname-input").val();

            //用户更改头像
            var file = $("#user-profile-upload").prop('files')[0];
            var metadata = {
                contentType: file.type,
            };
            var file_name = dateTime + '-' + file.name;
            var task = storageRef.child(file_name).put(file, metadata);

            task.then(snapshot => snapshot.ref.getDownloadURL())
                .then(url => {
                    console.log("用户头像上传成功 链接为: " + url);;
                    db.collection("user").doc(user.uid).update({
                        profile: url
                    });

                })

            //如果用户修改了姓名 云端更改用户全名
            if (userNewName != '') {
                db.collection("user").doc(user.uid).update({
                    name: userNewName
                });
            }

            //如果用户修改了昵称 云端更改用户昵称
            if (userNickName != '') {
                db.collection("user").doc(user.uid).update({
                    nickname: userNickName
                });
            }

            $('input[type="text"], textarea').val('');
        });
    });

    $(".nav-bar-item-wrap").mouseenter(function () {
        $(this).css({
            "color": "rgb(29, 161, 242)",
            "background-color": "rgb(245,248,250)",
            "border-radius": "25px",
            "transition": "all 0.5s",
            "cursor": "pointer"
        });

        $(this).find("i").css({
            "color": "rgb(29, 161, 242)",
            "transition": "all 0.5s"
        });
    });

    $(".nav-bar-item-wrap").mouseleave(function () {
        $(this).css({
            "color": "black",
            "background-color": "rgba(245,248,250,0)",
            "border-radius": "25px"
        });

        $(this).find("i").css("color", "black");
    });


    $(document).on("click touchstart", ".heart", function () {
        $(this).toggleClass('is_animating');
        console.log("点击❤️");
    });

    $(document).on("animationend", ".heart", function () {
        $(this).toggleClass('is_animating');
        console.log("点击❤️");
    });


    //所有用户的信息
    db.collection("user").get().then(function (snap) {
        snap.forEach(function (doc) {
            let recommend_name = doc.data().name;
            let recommend_nickname = doc.data().nickname;
            let recommend_profile = doc.data().profile;

            if (recommend_nickname == null) {
                recommend_nickname = "コート上の王様";
            } 

            if (recommend_profile == null) {
                recommend_profile = "Resource/user.jpg";
            } 

            let recommend_item = $("<div class=recommend-item>" +
                "<img class=recommend-user src=" + recommend_profile + " width=auto height=100px>" +
                "<div class=recommend-text-wrap>" +
                "<p class=recommend-item-name>" + recommend_name + "</p>" +
                "<p class=recommend-item-at>@" + recommend_nickname + "</p>" +
                "</div>" +
                "<button class=user-subscribe-btn>Follow</button>" +
                "</div>");

            $(".recommendation-block").append(recommend_item);
        });
    });

    var tagStat = [];
    db.collection("tag").get().then(function (snap) {
        snap.forEach(function (doc) {
            let tag_name = doc.data().TagName;
            tagStat.push(tag_name);
        });

        tagStat.sort();

        var current = null;
        var cnt = 0;
        for (var i = 0; i <= tagStat.length; i++) {
            if (tagStat[i] != current) {
                if (cnt > 0) {
                    console.log(current + ' 显示了' + cnt + '次');
                    //之后可以调节显示的数量
                    if (cnt > 0) {
                        let trend_block_item = $("<div class=trend-block-item>" +
                            "<p class=trend-block-where>Trending in Canada</p>" +
                            "<p class=trend-block-tag>#" + current + "</p>" +
                            "<p class=trend-block-post>" + cnt + " tweets</p>" +
                            "</div>");

                        $(".trend-block").append(trend_block_item);
                    }

                }
                current = tagStat[i];

                cnt = 1;
                //如果相等 递增
            } else {
                cnt++;
            }
        }
    });

    //表情hover的背景色数组
    colorList = ["#5a6a1d", "#b02b31", "#e2f929", "#6a48a7", "#499afa", "#0e7b23", "#f3c29d", "#fa60c4", "#9e7590"];

    //生成表情包 &# code
    for (var i = 128512; i <= 128580; i++) {
        var emoji_id = i;
        var emoji_item = $("<div class=emoji-item id=" + emoji_id + ">" + "&#" + i + "<div>");
        $("#emoji-modal").append(emoji_item);
    }

    //鼠标hover每个表情  背景色改变动画
    $(document).on("mouseenter", ".emoji-item", function () {
        var random_color = colorList[Math.floor(Math.random() * colorList.length)];
        $(this).css({
            "background-color": random_color,
            "transition": "background-color 0.5s"
        });
    });

    //鼠标离开后 无背景色
    $(document).on("mouseleave", ".emoji-item", function () {
        $(this).css("background", "none");
    });

    //点击表情 切换开关表情板class
    $("#emoji").click(function () {
        $("#emoji-modal-wrap").toggleClass("close-emoji");
    });

    //选中的表情id
    $(document).on("click", ".emoji-item", function () {
        var selected_emoji = "&#" + $(this).attr('id');
        document.getElementById("user-input").value += selected_emoji;
        $("#emoji-modal-wrap").toggleClass("close-emoji");
    });

    //赞tweet 
    $(document).on("click", ".tweet-like i", function () {
        var selected_tweet = $(this).parent().parent().attr('id');

        db.collection("tweet").doc(selected_tweet).get().then(function (doc) {
            var likecnt = doc.data().Like + 1;

            db.collection("tweet").doc(selected_tweet).update({
                Like: likecnt
            });
        });
    });

    //退出没有信息发送弹出的modal
    $("#zero-msg-btn").click(function () {
        $("#zero-msg-modal").fadeOut();
    });

    $("#info-btn").click(function () {
        $("#author-info-modal").fadeIn();
    });

    $("#exit-info").click(function () {
        $("#author-info-modal").fadeOut();
    });

    //退出当前用户 Sign out the user from firebase
    $("#logout-btn").click(function () {
        firebase.auth().signOut().then(function () {
            // Sign-out successful. Open up the login page
            window.location.replace("index.html");
        }).catch(function (error) {
            console.log("Erros...during signout");
        });

    });

});