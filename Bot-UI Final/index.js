
var botName = credentialsBotName;

var baseUrl = credentialsBaseUrl;

// Initialize Firebase
var config = credentialsConfig;

var lastSentMessage = "";
var lastRecievedMessage = 1;
var ButtonClicked = false;


var DEFAULT_TIME_DELAY = 200;

// Variable for the chatlogs div
var $chatlogs = $('.chatlogs');
	

$('document').ready(function(){
	
	// Hide the switch input type button initially
	$("#switchInputType").toggle();

	// If the switch input type button is pressed
	$("#switchInputType").click(function(event) {

		// Toggle which input type is shown
		if($('.buttonResponse').is(":visible")) {
			$("#switchInputType").attr("src", "Images/multipleChoice.png");
		}

		else {
			$("#switchInputType").attr("src", "Images/keyboard.png");
		}
		$('textarea').toggle();
		$('.buttonResponse').toggle();

	});

	// Method which executes once the enter key on the keyboard is pressed
	// Primary function sends the text which the user typed
	$("textarea").keypress(function(event) {
		
		// If the enter key is pressed
		if(event.which === 13) {

			// Ignore the default function of the enter key(Dont go to a new line)
			event.preventDefault();

			ButtonClicked = false;

			// Call the method for sending a message, pass in the text from the user
			send(this.value);
			
			// reset the size of the text area
			$(".input").attr("rows", "1");

			// Clear the text area
			this.value = "";

			if($("#switchInputType").is(":visible")) {
				$("#switchInputType").toggle();
				$('.buttonResponse').remove();
			}

		}
	});


	// If the user presses the button for voice input
	$("#rec").click(function(event) {

		// Call the method to switch recognition to voice input
		switchRecognition();
	});



	// If the user selects one of the dynamic button responses
	$('.chat-form').on("click", '.buttonResponse', function() {

		ButtonClicked = true;

		// Send the text on the button as a user message
		send(this.innerText);
		
		// Show the record button and text input area
		//$('#rec').toggle();
		$('textarea').toggle();

		// Hide the button responses and the switch input button
		$('.buttonResponse').toggle();
		$('#switchInputType').hide();

		// Remove the button responses from the div
		$('.buttonResponse').remove();
		
	});

})


function send(text) {


// Create a div with the text that the user typed in
	$chatlogs.append(
        $('<div/>', {'class': 'chat self'}).append(
            $('<p/>', {'class': 'chat-message', 'text': text})));

	// Find the last message in the chatlogs
	var $sentMessage = $(".chatlogs .chat").last();
	
	// Check to see if that message is visible
	checkVisibility($sentMessage);

	// update the last message sent variable to be stored in the database and store in database
	lastSentMessage = text;
//	storeMessageToDB();



var pars = {
    "message": text
};

var http = new XMLHttpRequest();
var url = 'http://localhost:5005/webhooks/rest/';
//var params = 'hi';
http.open('GET', url, true);

//Send the proper header information along with the request
http.setRequestHeader('Content-type', 'application/json');

http.onreadystatechange = function() {//Call a function when the state changes.
    if(http.readyState == 4 && http.status == 200) {
        alert(http.responseText);
	var msg=JSON.parse(http.responseText);
	//alert(msg[0].text);
	//var ms=msg.recipient_id;
	//alert(ms);
    
	newRecievedMessage(msg[0].text);
	newRecievedMessage(msg[1].text);
    }
}
http.send(JSON.stringify(pars));

// end of curl call chat bot

}

// Method called whenver there is a new recieved message
// This message comes from the AJAX request sent to API.AI
// This method tells which type of message is to be sent
// Splits between the button messages, multi messages and single message
function newRecievedMessage(messageText) {

	// Variable storing the message with the "" removed
	var removedQuotes = messageText.replace(/[""]/g,"");

	// update the last message recieved variable for storage in the database
	lastRecievedMessage = removedQuotes;

	// If the message contains a <ar then it is a message
	// whose responses are buttons
	if(removedQuotes.includes("<ar"))
	{
		buttonResponse(removedQuotes);	
	}

	// if the message contains only <br then it is a multi line message
	else if (removedQuotes.includes("<br")) 
	{
		multiMessage(removedQuotes);
	} 

	// There arent multiple messages to be sent, or message with buttons
	else
	{	
		// Show the typing indicator
		showLoading();

		// After 3 seconds call the createNewMessage function
		setTimeout(function() {
			createNewMessage(removedQuotes);
		}, DEFAULT_TIME_DELAY);
	}
}


// Method which takes messages and splits them based off a the delimeter <br 2500>
// The integer in the delimeter is optional and represents the time delay in milliseconds
// if the delimeter is not there then the time delay is set to the default
function multiMessage(message)
{

	// Stores the matches in the message, which match the regex
	var matches;

	// List of message objects, each message will have a text and time delay
	var listOfMessages = [];
	
	// Regex used to find time delay and text of each message
	var regex = /\<br(?:\s+?(\d+))?\>(.*?)(?=(?:\<br(?:\s+\d+)?\>)|$)/g;

	// While matches are still being found in the message
	while(matches = regex.exec(message))
	{
		// if the time delay is undefined(empty) use the default time delay
		if(matches[1] == undefined)
		{
			matches[1] = DEFAULT_TIME_DELAY;
		}

		// Create an array of the responses which will be buttons
		var messageText  = matches[2].split(/<ar>/);

		// Create a message object and add it to the list of messages
		listOfMessages.push({
				text: messageText[0],
				delay: matches[1]
		});
	}


	// loop index 
	var i = 0;

	// Variable for the number of messages
	var numMessages = listOfMessages.length;

	// Show the typing indicator
	showLoading();

	// Function which calls the method createNewMessage after waiting on the message delay
	(function theLoop (listOfMessages, i, numMessages) 
	{

		// Method which executes after the timedelay
		setTimeout(function () 
		{

			// Create a new message from the server
			createNewMessage(listOfMessages[i].text);
			
			// If there are still more messages
			if (i++ < numMessages - 1) 
			{   
				// Show the typing indicator
				showLoading();             

				// Call the method again
				theLoop(listOfMessages, i, numMessages);
			}
		}, listOfMessages[i].delay);
	
	// Pass the parameters back into the method
	})(listOfMessages, i, numMessages);

}


// Method called whenever an <ar tag is found
// The responses for this type of message will be buttons
// This method parses out the time delays, message text and button responses
// Then creates a new message with the time delay and creates buttons for the responses
function buttonResponse(message)
{

	// Stores the matches in the message, which match the regex
	var matches;

	// Used to store the new HTML div which will be the button	
	var $input;

	// send the message to the multi message method to split it up, message will be sent here
	multiMessage(message);
	
	// Regex used to find time delay, text of the message and responses to be buttons
	var regex = /\<br(?:\s+?(\d+))?\>(.*?)(?=(?:\<ar(?:\s+\d+)?\>)|$)/g;

	// Seach the message and capture the groups which match the regex
	matches = regex.exec(message);

	console.log(matches);

	// Create an array of the responses which will be buttons
	var buttonList = message.split(/<ar>/);

	// Remove the first element, The first split is the actual message
	buttonList = buttonList.splice(1);

	console.log(buttonList);

	// Array which will store all of the newly created buttons
	var listOfInputs = [];

	// Loop through each response and create a button
	for (var index = 0; index < buttonList.length; index++)
	{
		// Store the current button response
		var response = buttonList[index];
		
		// Create a new div element with the text for the current button response
		$input = $('<div/>', {'class': 'buttonResponse' }).append(
            $('<p/>', {'class': 'chat-message', 'text': response}));

		// add the new button to the list of buttons
		listOfInputs.push($input);
	}


	// Show the typing indicator
	showLoading();
	
	// After the time delay call the createNewMessage function
	setTimeout(function() {http://localhost:5005/webhooks/rest/webhook   --header 'content-type: application/json'   --data '{ "message": "hi"}'
			
		
		// Hide the send button and the text area
		// $('#rec').toggle();
		$('textarea').toggle();

		// Show the switch input button
		$("#switchInputType").show();

		// For each of the button responses
		for (var index = 0; index < listOfInputs.length; index++) {
						
			// Append to the chat-form div which is at the bottom of the chatbox
			listOfInputs[index].appendTo($('#buttonDiv'));
		}

			
		webhooks
	}, matches[1]);

}


// Method to create a new div showing the text from API.AI
function createNewMessage(message) {

	// Hide the typing indicator
	hideLoading();

	// take the message and say it back to the user.

	// Append a new div to the chatlogs body, with an image and the text from API.AI
	$chatlogs.append(
		$('<div/>', {'class': 'chat friend'}).append(
			$('<div/>', {'class': 'user-photo'}).append($('<img src="Images/ana.JPG" />')), 
			$('<p/>', {'class': 'chat-message', 'text': message})));

	// Find the last message in the chatlogs
	var $newMessage = $(".chatlogs .chat").last();

	// Call the method to see if the message is visible
	checkVisibility($newMessage);
}



// Funtion which shows the typing indicator
// As well as hides the textarea and send button
function showLoading()
{
	$chatlogs.append($('#loadingGif'));
	$("#loadingGif").show();

	// $('#rec').css('visibility', 'hidden');
	// $('textarea').css('visibility', 'hidden');

	$('.chat-form').css('visibility', 'hidden');
 }


// Function which hides the typing indicator
function hideLoading()
{
	$('.chat-form').css('visibility', 'visible');
	$("#loadingGif").hide();

	// Clear the text area of text
	$(".input").val("");

	// reset the size of the text area
	$(".input").attr("rows", "1");
	
}


// Method which checks to see if a message is in visible
function checkVisibility(message)
{
	// Scroll the view down a certain amount
	$chatlogs.stop().animate({scrollTop: $chatlogs[0].scrollHeight});
}


//----------------------------------------- Resize the textarea ------------------------------------------//
$(document)
    .one('focus.input', 'textarea.input', function(){
        var savedValue = this.value;
        this.value = '';
        this.baseScrollHeight = this.scrollHeight;
        this.value = savedValue;
    })
    .on('input.input', 'textarea.input', function(){
        var minRows = this.getAttribute('data-min-rows')|0, rows;
        this.rows = minRows;
        rows = Math.ceil((this.scrollHeight - this.baseScrollHeight) / 17);
        this.rows = minRows + rows;
	});
	
