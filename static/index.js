$(document).ready(function() {

    var noteId;



    // open the clicked note on a bigger scale
    openNote();

    // close the selected note
    $(".overDisplay").click(function() {

        // update the css of the elements to hide the new note
        $(".note").css("z-index", "initial");
        $(".overDisplay").css("display", "none");
        $(".noteEdit").css("display", "none");
    });

    // update the edited note
    $(".saveEdit").click(function() {

        // get the edited note infomation
        var noteName = $('.noteEdit-heading').val();
        var note = $('.noteEdit-content').val();

        // send an ajax request to the surver to update the database with the note information
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

            // set the editeed notes fields
            $('#' + noteId).children().children('.note-heading-text').text(data.noteName);
            $('#' + noteId).children('.note-content').text(data.note);

            // update the css of the elements to hide the new note 
            $(".note").css("z-index", "initial");
            $(".overDisplay").css("display", "none");
            $(".noteEdit").css("display", "none");
        })
    });


    $(".delete").click(function(evt) {

        // prevent the note from opeining when delete button is clicked
        evt.stopPropagation();

        // ask the user for confirmation for the note to be deleted
        if (confirm('This memory will be deleted')) {

            // get the id from the note that needs to be deleted
            noteIds = [$(this).parent().parent().attr('id')]

            // send an ajax request to the surver to delete the note from the database
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

    // on press of the add button redirect ueer to the add page
    $('.add').click(function() {
        window.location.href = '/add';
    })

    // on press of the edit button
    $('.edit-btn').click(function() {

        // style the elements 
        $(".selector").css("display", "initial");
        $(".note-heading-text").css("width", "80%");
        $('.note').mouseout(function() {
            $(this).children().children(".note-heading-text").css("width", "80%");
        })
        $(".delete-btn").css("display", "initial");
        $(".add-btn, .edit-btn").css("display", "none");

        // remove the delete button from appearing on hover
        $('.note').mouseover(function() {
            $(this).children().children(".delete").css("display", "none");
        })

        // prevent the note from opeining when note is clicked
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

                    // send an ajax request to the surver to delete the notes from the database 
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

    // make the notes not selectable
    $('.closeSelector').click(function() {
        offSelect();
    })

    // remove the delete icon on touch screen devices
    if ("ontouchstart" in document.body) {
        $(".delete").css("visibility", "hidden");
    }

    function openNote() {
        $(".note").click(function(evt) {
            // get the hight of the page
            var height = document.documentElement.scrollHeight - 1

            // get the values of the cliked note
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
});