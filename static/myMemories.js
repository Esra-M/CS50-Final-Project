$(document).ready(function() {

    var noteId;

    // open the clicked note on a bigger scale 
    $(".note").click(function(evt) {

        // get the hight of the page
        var height = document.documentElement.scrollHeight

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

        evt.stopPropagation();

        noteId = $(this).parent().attr('id')

        if (confirm('Are you sure you want to delete this element?')) {
            // send an ajax request to the surver to update the database with the note information
            req = $.ajax({
                type: 'POST',
                url: '/delete',
                data: {
                    "noteId": noteId,
                }
            });

            $('#' + noteId).fadeOut(200);
        }

    });
});