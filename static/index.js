$(document).ready(function() {

    // set the color theme of the website
    if (localStorage["dark-mode"] === "true") {
        $("body").addClass("dark-mode");
        $('.form-check-input').prop('checked', true);
    } else {
        $("body").removeClass("dark-mode");
    }

    var noteId;

    // open the clicked note on a bigger scale
    openNote();

    // close the selected note
    $(".overDisplay").click(function() {

        hideElements();

    });

    // update the edited note
    $(".saveEdit").click(function() {

        // get the edited note infomation
        var noteName = $('.noteEdit-heading').val();
        var note = $('.noteEdit-content').val();

        // send an ajax request to the server to update the database with the note information
        req = $.ajax({
            type: 'POST',
            url: '/edit',
            data: {
                "noteId": noteId,
                "noteName": noteName,
                "note": note
            }
        });

        // update the edited note with the current data
        req.done(function(data) {

            // set the edited notes fields
            $('#' + noteId).children().children('.note-heading-text').text(data.noteName);
            $('#' + noteId).children('.note-content').text(data.note);

            // update the css of the elements to hide the new note 
            $(".note").css("z-index", "initial");
            $(".overDisplay").css("display", "none");
            $(".noteEdit").css("display", "none");
        })
    });


    // delete note
    $(".delete").click(function(evt) {

        // prevent the note from opening when delete button is clicked
        evt.stopPropagation();

        // ask the user for confirmation for the note to be deleted
        if (confirm('This memory will be deleted')) {

            // get the id from the note that needs to be deleted
            noteIds = [$(this).parent().parent().attr('id')]

            // send an ajax request to the server to delete the note from the database
            req = $.ajax({
                type: 'POST',
                url: '/delete',
                data: {
                    "noteIds": noteIds
                }
            });

            // remove the note that has been deleted from the screen
            $('#' + noteIds).fadeOut(200);
        }
    });

    // on press of the add button redirect user to the add page
    $('.add, .add-btn').click(function() {
        // get the hight of the page
        var height = document.documentElement.scrollHeight - 0.01

        // make the note open on bigger display
        $(".addNote").css("display", "initial");
        $(".overDisplay").css("display", "block");
        $(".overDisplay").css("height", height);

        // set the autofocus to the heading
        $(".big-note-heading").focus();

    })

    // on press of the edit button
    $('.edit-btn').click(function() {

        // style the elements 
        $(".selector").css("display", "initial");
        $(".note-heading-text").css("width", "70%");
        $('.note').mouseout(function() {
            $(this).children().children(".note-heading-text").css("width", "80%");
        })
        $(".delete-btn").css("display", "initial");
        $(".exit-btn").css("display", "initial");
        $(".add-btn, .edit-btn").css("display", "none");

        // remove the delete button from appearing on hover
        $('.note').mouseover(function() {
            $(this).children().children(".delete").css("display", "none");
        })

        // prevent the note from opening when note is clicked
        $(".note").off("click");

        // select the note when clicked
        $('.note').click(function() {
            $(this).toggleClass('selected');

            // update the selector counter
            $('.selectorCount').css("display", "flex");
            var selecterCount = $('.selected').length
            $('.selectorCount span').text(selecterCount + " selected");
        })

        // delete selected notes
        $('.delete-btn').click(function() {

            // get the ids of the selected notes
            var noteIds = [];
            $(".selected").each(function() {
                noteIds.push($(this).attr('id'));
            })

            // check if any notes have been selected
            if (noteIds.length > 0) {

                // ask the user for confirmation for the notes to be deleted
                if (confirm('The selected memories will be deleted')) {

                    // send an ajax request to the server to delete the notes from the database 
                    $('#error_message').html("Error");
                    req = $.ajax({
                        type: 'POST',
                        url: '/delete',
                        data: {
                            "noteIds": noteIds
                        }
                    });

                    // remove the notes that have been deleted from the screen
                    noteIds.forEach(function(noteId) {
                        $('#' + noteId).fadeOut(200);
                    })

                    // make the notes not selectable
                    offSelect();

                } else {
                    // if the deletion is canceled make the notes not selectable
                    offSelect();
                }

            } else {
                // if no notes have been selected make the notes not selectable
                offSelect();
            }
        })
    })

    // make the notes not selectable after closing the selector
    $('.closeSelector').click(function() {
        offSelect();
    })

    // remove the delete icon on touch screen devices
    if ("ontouchstart" in document.body) {
        $(".delete").css("visibility", "hidden");
    }

    $('.settings-btn').click(function() {
        // get the hight of the page
        var height = document.documentElement.scrollHeight - 0.01

        $(".settings").css("display", "initial");
        $(".overDisplay").css("display", "block");
        $(".overDisplay").css("height", height);

    })

    // settings

    // on switch of the dark mode toggle
    $(".form-check-input").change(function() {

        // check if dark mode is on
        if (this.checked) {
            // set the dark mode
            localStorage["dark-mode"] = "true";
            $("body").addClass("dark-mode");

        } else {
            // remove dark mode
            localStorage["dark-mode"] = "false";
            $("body").removeClass("dark-mode");
        }
    });

    // edit account information
    $(".edit-account").click(function() {

        // enable the input fields
        $(".edit-account").css('display', "none");
        $(".username").prop('disabled', false);
        $(".password").prop('disabled', false);
        $(".save-changes").prop('disabled', false);
        $(".bi-eye-slash").css('display', "initial");

    });

    // make password visible
    $('.visible').click(function() {

        // toggle between visible and invisible password
        if ('password' == $(this).parent().children('.password').attr('type')) {
            $(this).parent().children('.password').prop('type', 'text');
        } else {
            $(this).parent().children('.password').prop('type', 'password');
        }

        // change the icons
        $(this).parent().children(".visible").css('display', "initial")
        $(this).css('display', "none")
    });

    // update the account information
    $(document).on("submit", '#account', function() {

        // disable all previous error messages
        $(".account p").css("display", "none")

        // select the user information from the input fields
        var username = $("[name='username']").val();
        var password = $("[name='password']").val();
        var newPass = $("[name='new-pass']").val();

        // send the data to flask to be updated in the database
        req = $.ajax({
            type: "Post",
            url: "/account",
            data: {
                "username": username,
                "password": password,
                "newPass": newPass
            }
        });

        // get data from flask
        req.done(function(data) {

                // display possible error messages
                if (data.userError == true) {
                    $(".userError").css("display", "initial")
                } else if (data.passError == true) {
                    $(".passError").css("display", "initial")
                } else if (data.newPassError == true) {
                    $(".newPassError").css("display", "initial")
                    $(".save-changes").css("margin-top", "20px")
                } else {

                    // if the data is valid alert the user of the changes made
                    hideElements();
                    if (data.userChange == true || data.passChange == true) {
                        // display the alert 
                        $(".alert").css('display', 'initial');

                        setTimeout(function() {
                            $(".alert").fadeOut(300);
                        }, 5000);
                    }
                }

                // set the text of the alert 
                if (data.userChange == true && data.passChange == true) {
                    $(".alert").text("Account has been updated");
                } else if (data.passChange == true) {
                    $(".alert").text("Password has been updated");
                } else if (data.userChange == true) {
                    $(".alert").text("Username has been updated");
                }
            })
            // prevent the page from reloading
        return false;

    });

    function openNote() {
        $(".note").click(function(evt) {
            // get the hight of the page
            var height = document.documentElement.scrollHeight - 0.01

            // get the values of the clicked note
            noteId = $(this).attr('id')
            var noteName = $(this).children().children('.note-heading-text').text();
            var note = $(this).children('.note-content').text();

            // set the values in the new note fields
            $(".noteEdit-heading").val(noteName);
            $(".noteEdit-content").val(note);

            // update the css of the elements to show the new note
            $(".note").css("z-index", "-1");
            $(".overDisplay").css("display", "block");
            $(".overDisplay").css("height", height);
            $(".noteEdit").css("display", "flex");

        });
    }

    function offSelect() {
        // restore the original styling of the elements
        $(".selector").css("display", "none");
        $(".note-heading-text").css("width", "initial");
        $(".delete-btn").css("display", "none");
        $(".exit-btn").css("display", "none");
        $(".add-btn, .edit-btn").css("display", "initial");
        $('.selectorCount').css("display", "none");

        // make the delete button visible on hover
        $('.note').mouseover(function() {
            $(this).children().children(".delete").css("display", "initial");
            $(this).children().children(".note-heading-text").css("width", "80%");
        })

        $('.note').mouseout(function() {
            $(this).children().children(".delete").css("display", "none");
            $(this).children().children(".note-heading-text").css("width", "initial");
        })

        // prevent the notes from being selected
        $(".note").off("click");

        // remove the selected class 
        $(".note").removeClass("selected");

        // open the clicked note on a bigger scale when clicked
        openNote();
    }

    function hideElements() {
        // update the css of the elements to hide the big note and the settings
        $(".overDisplay, .noteEdit, .addNote, .settings, .visible, .account p").css("display", "none");
        $(".big-note-content, .big-note-heading, .username, .password, .new-pass").val("");
        $(".note").css("z-index", "initial");
        $(".edit-account").css('display', "initial");
        $(".save-changes, .username, .password").prop('disabled', true);
        $(".save-changes").css('margin-top', "50px");
    }
});