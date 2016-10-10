/*
  @2016 Supanut Dokmaithong
  Google App Script for Get and Set Google Spreadsheet
*/

/*
Usage
 1. In your document file menu, you'll find File Menu > Tools > Script Editor (you will be redirected to Google's script editor)

 2. Copy and Paste this script to Script Editor and Save

 3. you'll find Run > setup

 4. Publish > Deploy as web app 
   - enter Project Version name and click 'Save New Version' 
   - set security level and enable service (most likely execute as 'me' and access 'anyone, even anonymously) 

 5. Copy the 'Current web app URL' and post this in your form/script action 

 6. Get or Set on your destination sheet matching the parameter names of the data you are passing in (exactly matching case)

 ****NOTE: need "mode" and "sheetname" parameter
*/

var SCRIPT_PROP = PropertiesService.getScriptProperties(); // new property service

// setup() is function of Active Spreadsheet for insert data to Spreadsheet
function setup() {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    SCRIPT_PROP.setProperty("key", doc.getId());
}

function doGet(request){
  if(request.parameters.mode == null){
    return ContentService
          .createTextOutput(JSON.stringify({"result":"mode parameter is null value"}))
          .setMimeType(ContentService.MimeType.JSON);
  }else{
    return selectMode(request.parameters.mode,request);
  }
}

function doPost(request){
  if(request.parameters.mode == null){
    return ContentService
          .createTextOutput(JSON.stringify({"result":"mode parameter is null value"}))
          .setMimeType(ContentService.MimeType.JSON);
  }else{
    return selectMode(request.parameters.mode,request);
  }
}

function selectMode(mode,request){
  if(mode == "set"){
    return handleResponseSet(request);
  }else if(mode == "get"){
    return handleResponseGet(request);
  }
}

function handleResponseSet(request){
  var output = ContentService.createTextOutput();
  var lock = LockService.getPublicLock();
  lock.waitLock(30000);  // wait 30 seconds before conceding defeat.

  try {
    var doc = SpreadsheetApp.openById(SCRIPT_PROP.getProperty("key"));
    var sheetname = request.parameter.sheetname;
    var sheet = doc.getSheetByName(sheetname); //request.parameter.sheetname is sheet name parameter

    //check sheetname 
    if(sheetname == null){
      output
      .setContent(JSON.stringify({"result":"No sheetname parameter"}))
      .setMimeType(ContentService.MimeType.JSON);
      return output;
    }

    // we'll assume header is in row 1 but you can override with header_row in GET/POST data
    var headRow = request.parameter.header_row || 1;
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var nextRow = sheet.getLastRow()+1; // get next row
    var row = [];
    
    // loop through the header columns
    for (i in headers){
      if (headers[i] == "Timestamp"){ // special case if you include a 'Timestamp' column
        row.push(new Date());
      } else if (headers[i] == "No."){ // special case if you include a 'No.' column
        row.push(sheet.getLastRow());
      }else{ // else use header name to get data
        row.push(request.parameter[headers[i]]);
      }
    }
    // more efficient to set values as [][] array than individually
    sheet.getRange(nextRow, 1, 1, row.length).setValues([row]);
    // return json success results
    output
    .setContent(JSON.stringify({"result":"success", "row": nextRow}))
    .setMimeType(ContentService.MimeType.JSON);
    return output;
  } catch(e){
    // if error return this
    output
    .setContent(JSON.stringify({"result":"error", "error": e}))
    .setMimeType(ContentService.MimeType.JSON);
    return output;
  } finally { //release lock
    lock.releaseLock();
  }
}

function handleResponseGet(request){
  var output = ContentService.createTextOutput();
  var data = {};
  var doc = SpreadsheetApp.openById(SCRIPT_PROP.getProperty("key"));
  var sheetname = request.parameter.sheetname;

  //check sheetname 
  if(sheetname == null){
    output
    .setContent(JSON.stringify({"result":"No sheetname parameter"}))
    .setMimeType(ContentService.MimeType.JSON);
    return output;
  }

  data[sheetname] = readData(doc, sheetname);
  output.setContent(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  
  return output;
}

function readData(doc, sheetname, properties) {
  var sheet = doc.getSheetByName(sheetname);
  var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  var data = [];

  if (typeof properties == "undefined") {
    properties = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]; 
    properties = properties.map(function(p) { return p.replace(/\s+/g, '_'); });
  }
  
  for (r = 0, l = rows.length; r < l; r++) {
    var row = rows[r],
        record = {};

    for (p in properties) {
      record[properties[p]] = row[p];
    }
    
    data.push(record);

  }
  return data;
}