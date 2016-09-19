var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

var Templates ={
	roundEntry: function(round,openStart,openEnd,closedStart,closedEnd){
		return '\t{\n'+'\t\t"round": '+'"'+round+'"'+',\n'
			+'\t\t"openBiddingStart": '+openStart+',\n'
			+'\t\t"openBiddingEnd": '+openEnd+',\n'
			+'\t\t"closedBiddingStart": '+closedStart+',\n'
			+'\t\t"closedBiddingEnd": '+closedEnd+'\n'
			+'\t}';
	}

}

//checks to see if the key is the name of a round
function isRoundName(key){
	var roundNames = ['0','1A','1B','1C','2A','2B','3A','3B'];
	for (x in roundNames){
		if (key === roundNames[x]){
			return 1;
		}
	}
	return 0;
}

function formatDate(date){
	var months = ['January','Febuary','March','April','May','June',
			'July','August','September','October','November','December']; 
	date = date.split('/');
	var day = date[0];
	var month = months[parseInt(date[1])-1];
	var year = date[2];
	return month+' '+day+', '+year;

}

//gets the start and end times 
function getStartEnd(text){
	if (text.length===32){
		text = text.split('to');
		var startDate = formatDate(text[0].slice(0,10));
		var startTime = text[0].slice(10,15);
		var endDate = formatDate(text[1].slice(0,10));
		var endTime = text[1].slice(10,15);
	}
	else if(text==='N/A'){
		return ['null','null'];
	}
	else{
		text = text.split('to');
		var startDate = formatDate(text[0].slice(0,10));
		var startTime = text[0].slice(10,15);
		var endDate = formatDate(text[0].slice(0,10));
		var endTime = text[1].slice(0,5);

	}
	return ['"'+startDate+', '+startTime+'"','"'+endDate+', '+endTime+'"'];

}


//create a new entry and append it to file
function writetoFile(round,openBid1,openBid2,closedBid){
	if (!openBid2){
		var openTimes = getStartEnd(openBid1);
	}
	else{
		var openTimes = getStartEnd(openBid1);
		var open2 = getStartEnd(openBid2);
		openTimes[1] = open2[1];
	}
	var closedTimes = getStartEnd(closedBid);
	var newEntry = Templates.roundEntry(round,openTimes[0],openTimes[1],closedTimes[0],closedTimes[1]);
	//prevents the trailing ',' on the last entry
	if (round != '3B'){
		fs.appendFileSync('corsSchedule.json', newEntry+',\n');
	}
	else{
		fs.appendFileSync('corsSchedule.json', newEntry+'\n');
	}
	console.log('Round: '+round+' Done.\n');

}

//splits up the text into it's different categories and passes
//them into the write function
function processText(text){
	var round = text[0];
	//does round 2A always have 2 open bidding slots?
	if (round === '2A'){
		var openBid1 = text[1]; 
		var openBid2 = text[2];
		var closedBid = text[3];
		writetoFile(round,openBid1,openBid2,closedBid);
	}
	else {
		var openBid1 = text[1];
		var openBid2 = null;
		var closedBid = text[2];
		writetoFile(round,openBid1,openBid2,closedBid);
	}
}


var corsSite = "http://www.nus.edu.sg/cors/schedule.html"
fs.appendFileSync('corsSchedule.json', '[\n');
console.log("visiting "+corsSite);
request(corsSite,function(error,response,body){
	var $page = cheerio.load(body);
	$page('tbody:has(td.tableheader)>tr').each(function(index){
		var text = $page(this).text().trim()
		//I know, this is pretty weird,but it works somehow since the 
		//formating on cors is pretty weird as well
		text = text.replace(/(\r\n\t\t\t\t)/gm,"X")
				   .replace(/(\r\n|\n|\r)/gm,"X")
				   .replace(/\s/g,"")
				   .replace('XX','X')
				   .replace('XX','X');
		text = text.split('X');
       	if (isRoundName(text[0])){
       		processText(text);
       		}
	});
	fs.appendFileSync('corsSchedule.json', ']');
});

