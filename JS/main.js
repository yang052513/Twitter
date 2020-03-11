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

                var tweet_tag;
                var tweet_tag_wrap = $("<div class=tweet-tag-wrap></div>");
                if (change.doc.data().Tag != null) {
                    for (var i = 0; i < change.doc.data().Tag.length; i++) {
                        tweet_tag = $("<button class=tweet-tag>" + change.doc.data().Tag[i] + "</button>");
                        tweet_tag_wrap.append(tweet_tag);
                    }
                }

                if (tweet_image == null) {
                    var user_post = $("<div class=user-post>" +
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
                    user_post.append(tweet_tag_wrap);

                } else {
                    var user_post = $("<div class=user-post>" +
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
                    user_post.append(tweet_tag_wrap);
                }

                //加入新的推文 
                if (change.type == "added") {
                    $("#post-container").prepend(user_post);
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
                $(".tag-placeholder").append("<button class=tweet-tag>" + tagMsg +"</div>");
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
                    alert('wtfsddfdfdf');
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
                            };
                            db.collection("tweet").add(tweetData);
                            tag = [];
                        })
                    $('input[type="text"], input[type="file"], textarea').val('');

                    //用户选择只上传信息 没有图片
                } else if (file == null && tweetContent != '') {
                    var tweetData = {
                        Content: tweetContent,
                        Date: dateTime,
                        Name: user_name,
                        Nickname: user_nickname,
                        Profile: user_profile,
                        Tag: tag,
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
                    let trend_block_item = $("<div class=trend-block-item>" +
                        "<p class=trend-block-where>Trending in Canada</p>" +
                        "<p class=trend-block-tag>#" + current + "</p>" +
                        "<p class=trend-block-post>" + cnt + " tweets</p>" +
                        "</div>");

                    $(".trend-block").append(trend_block_item);
                }
                current = tagStat[i];

                cnt = 1;
                //如果相等 递增
            } else {
                cnt++;
            }
        }
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