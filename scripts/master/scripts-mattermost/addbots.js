/*******************************************************************************
*Copyright 2018 Cognizant Technology Solutions
* 
* Licensed under the Apache License, Version 2.0 (the "License"); you may not
* use this file except in compliance with the License.  You may obtain a copy
* of the License at
* 
*   http://www.apache.org/licenses/LICENSE-2.0
* 
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
* WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the
* License for the specific language governing permissions and limitations under
* the License.
 ******************************************************************************/

var request=require('request');
var fs=require('fs');
var addbots= function (fileid,callback) {

//process.env.ONBOTS_URL+
var onbot_url = process.env.ONBOTS_URL+"/deployBot"


var headers = {
    'authorization': 'Bearer '+process.env.AUTH_TOKEN
}
var fileoptions = { 

method: 'get',
headers: headers,
  url: process.env.MATTERMOST_URL+'/api/v4/files/'+fileid,
};
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
request(fileoptions, function (error, response, filebody) {

if(filebody){
	console.log(filebody)
	filebody=JSON.parse(filebody)
	var data=filebody
	//add to db
	var dboptions = { 
	method: 'post',
	url: process.env.ONBOTS_URL+'/newbot',
	body: data,
	json:true
	};
	var patt = /^[a-z0-9-]*$/;
	if(patt.test(data.BotName) ){
		var validateoptions = { 

		method: 'get',
		
		url: process.env.ONBOTS_URL+'/validate/'+data.BotName
	};
	
	request(validateoptions, function (error, response, validbody) {
		console.log(validbody)
		console.log(error)
		if(validbody=="valid botname"){
	
	
	request(dboptions, function (error, response, dbbody) {

	if(dbbody){
		console.log(dbbody)
	}
	})
	data.Matter="MATTERMOST_TOKEN="+data.Matter
	data.MatterInURL="MATTERMOST_INCOME_URL="+data.MatterInURL
	data.vars=[]
	for(var i=0;i<filebody.configuration.length;i++){
		
		data.vars.push(filebody.configuration[i].bot_env+"="+filebody.configuration[i].value)
		
	}
	//console.log(data)
	var options = { 

method: 'post',
  url: onbot_url,
  headers: {"Content-type":"application/json"},
  body: data,
  json:true
   };

request(options, function (error, response, body) {

if(body){
	console.log(body)
	if(body.indexOf("error")==-1){
	data.status="on"
	var statusoptions = { 

		method: 'put',
		url: process.env.ONBOTS_URL+'/newbot/'+data.BotName,
		headers: {"Content-type":"application/json"},
		body: data,
		json:true
	};
	
	request(statusoptions, function (error, response, body) {
		
		console.log("status:::"+body)
	})
	}
	var file=['.sh','.yaml']
	for(var i=0;i<file.length;i++){
	var removeoptions = { 

	method: 'get',
	url: process.env.ONBOTS_URL+"/deletefiles/"+data.BotName+file[i],
	headers: {"Content-type":"application/json"},
	
	json:true
   };
   request(removeoptions, function (error, response, removebody) {
	   
	   if(removebody){
		   console.log(removebody)
	   }
	   
   })
   }
	callback(null,body,null)

}
console.log(error)
})
}
else{
	callback(null,null,"bot name already exist")
}
})
}
else{
	callback(null,null,"not valid bot name")
}
}
console.log(error)
})

  


}

module.exports = {
  addbots: addbots	// MAIN FUNCTION
  
}
