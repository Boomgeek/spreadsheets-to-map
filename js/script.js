var map;
var target;
var spinner;
var lineCount = 0;
var defaultZoom;
var sheetData = [];
var lineTemp = [];
var linePopupTemp = [];
var markerTemp = [];
var sheetTemp = [];
var suggestIndex;
var sheetAPI = "https://script.google.com/macros/s/AKfycbyB-DrKYoQDPMIu2oXYXaFwS3DTDy-z-5LHIWiORLvfpmbfD04/exec";


	// Global function
	function init() {
		map = new longdo.Map({
			layer: [ longdo.Layers.NORMAL ],
			zoom: 14,
            location: { lon:100.53, lat:13.74 },
			placeholder: document.getElementById('map'),
			lastView: true
		});

		// create layer control
		$(map.Ui.TopRight).append('<div id="road-container"><div id="road-topic">ชั้นข้อมูล (LAYER) <span id="road-topic-span" class="glyphicon glyphicon-chevron-up" style="float:right" aria-hidden="true"></span></div><div id="road-table-div" class="class="container"></div></div>');

		map.Event.bind('overlayDrop', function(overlay) {
			if(!(overlay instanceof longdo.Polyline) && !(overlay instanceof longdo.Polygon)){
				overlay.pop();
	            $("#lat-val-"+overlay.id).html(overlay.location().lat);
	            $("#lon-val-"+overlay.id).html(overlay.location().lon);
	            $("#location-latlon-val-"+overlay.id).html(overlay.location().lat.toFixed(6));
	            $("#location-latlon-val-"+overlay.id).append(", "+overlay.location().lon.toFixed(6));
	            map.Search.address.id = overlay.id;
	            map.Search.address({lat:overlay.location().lat, lon:overlay.location().lon});
			}
        });

        map.Event.bind('overlayClick', function(overlay) {
			if((overlay instanceof longdo.Polyline || overlay instanceof longdo.Polygon) && !(overlay.added) && (overlay.editable != undefined)){
				// check pre overlay == now overlay 
				if(overlay === lineTemp[lineCount]){
					lineTemp.pop();
					linePopupTemp.pop();
				}
				lineTemp.push(overlay);
				addPopupMultiLine();
			}
        });

    	map.Event.bind('address', function(address) {
            var adress_txt = '';
            adress_txt += (address.road ? address.road+ " " : '');
            adress_txt += (address.subdistrict ? address.subdistrict+ " " : '');
            adress_txt += (address.district ? address.district+ " " : '');
            adress_txt += (address.province ? address.province+ " " : '');
            adress_txt += (address.postcode ? address.postcode+ " " : '');
            $("#Description_address-"+map.Search.address.id).val(adress_txt);
        });
	}

	function getSheetName(callback){
		getSpreadSheet("SHEET_SETTING", function(res){
			for(var i=0; i<res['SHEET_SETTING'].length; i++){
				sheetData[i] = {sheetName: res['SHEET_SETTING'][i]['Sheetname']};
			}
			callback(sheetData);
		});
	}

	function addSheet(sheetName){
		getSpreadSheet(sheetName,
		function(res) {
			if(res[sheetName][0]['Line']){
				createSelectLine(res[sheetName][0]['color'],sheetName);
				for(var i=0; i<res[sheetName].length; i++){
					if(!!res[sheetName][i]['Line']){
						addLine(sheetName, res[sheetName][i]['Line'], res[sheetName][i]['Title'], res[sheetName][i]['color'], res[sheetName][i]['Zoom'], descriptFilter(sheetName,res,i));
					}
				}
			}else{
				createSelectIcon(res[sheetName][0]['Icon'],sheetName);
				jsonToMarker(sheetName, res);
			}
		});
	}

	function getSpreadSheet(sheetName, callback){
		$.ajax({
			url: sheetAPI,
			type: "GET",
			datatype: "jsonp",
			data: "&mode=get&sheetname="+sheetName,
			beforeSend: function(){
		    	spinLoading();
		   	},
			success: function(res){
				//console.log(res);
				sheetTemp.push(res);
				addColumnsNameToSheetTemp();
				callback(res);
			},
			complete: function() {
		        spinRemove();
		    }
		});
	}

	function addColumnsNameToSheetTemp(){
    	for(var n=0; n<sheetTemp.length; n++){
			var str = '';
			for(var i=0; i<Object.keys(sheetTemp[n][Object.keys(sheetTemp[n])[0]][0]).length; i++){
				str += Object.keys(sheetTemp[n][Object.keys(sheetTemp[n])[0]][0])[i];
				if(i != Object.keys(sheetTemp[n][Object.keys(sheetTemp[n])[0]][0]).length-1){
					str += ",";
				}
				sheetTemp[n].columns = str;
			}
		}
    }

	function jsonToMarker(sheetName,res){
		//descriptFilter(sheetName,res);
		rr = res;
		for(var i=0; i<res[sheetName].length; i++){
			icon = res[sheetName][i]['Icon'];
			title = res[sheetName][i]['Title'];
			description = descriptFilter(sheetName,res,i);
			zoom = res[sheetName][i]['Zoom'];
			lat = res[sheetName][i]['Latitude'];
			lon = res[sheetName][i]['Longitude'];
			markerTemp.push(addMarker(sheetName, icon, title, description, zoom, lat, lon));

			// set default zoom 1 time
			if(markerTemp.length == 1){
				defaultZoom = markerTemp[0].visibleRange().min;
			}
		}
	}

	function descriptFilter(sheetName,res,n){
		var descriptionObj = {};
		for(var i=0; i<sheetTemp.length; i++){
			if(Object.keys(sheetTemp[i])[0] == sheetName){
				var listColName = sheetTemp[i].columns;
				listColName = listColName.split(",");

				for(var a=0; a<listColName.length; a++){
					// use RegExp.test for check "Description"
					// return ture if colomn prefix name is Description
					if(/^Description/.test(listColName[a])){
						descriptionObj[listColName[a]] = res[sheetName][n][listColName[a]];
					}
				}
			}
		}
		return descriptionObj;
	}

	function addMarker(sheetName, icon, title, description, zoom, lat, lon){
		// create dinamic description
		var str = '<hr style="color: #ddd; width: 100%; min-width: 250px; margin-top:0; margin-bottom: 8; border-style: inset; border-width: 1px;"><table style="min-width: 250px;"><tbody>';
		for(var i=0; i<Object.keys(description).length; i++){
			str += '<tr>';
			str += '<td style="width: 40%; text-transform: capitalize; padding-bottom:4px">';
			str += Object.keys(description)[i].toString().replace("Description_", "").replace(/_/g, " ");
			str += '</td>';
			str += '<td style="width: 60%; padding-bottom:4px">';
			str += description[Object.keys(description)[i]] != "" ? description[Object.keys(description)[i]] : '-' ;
			str += '</td></tr>';
		}
		str += '</tbody></table>';

		//fix title is not string
		title = title.toString();

		var marker = new longdo.Marker({ lon: lon, lat: lat },
		{
		  title: title,
		  icon: {
		    url: icon
		  },
		  detail: str,
		  visibleRange: { min: zoom, max: 20 },
		  draggable: false
		});
		map.Overlays.add(marker);
		marker.icontype = sheetName;
		marker.description = description;
		marker.id = markerTemp.length;
		return marker;
	}

	function deleteMarker(sheetName){
		for(var i=0; i<markerTemp.length; i++){
			if(markerTemp[i] && markerTemp[i].icontype == sheetName){
				map.Overlays.remove(markerTemp[i]);
				delete markerTemp[i];
			}
		}
	}

	function createSelectIcon(icon,sheetName){
		var row = '<div class="row">';
		row += '<div class="col-xs-1"><img class="fix-Img-icon" src="'+icon+'"></div>';
		row += '<div class="col-xs-8" style="white-space: nowrap;">'+sheetName.replace("-", " ").toUpperCase()+'</div>';
		row += '<div class="col-xs-1"><input class="check_val" type="checkbox" line="0" value="'+sheetName+'" idx="'+(sheetTemp.length-1)+'" checked="checked"></div></div>';
		$('#road-table-div').append(row);
	}

	function createSelectLine(color,sheetName){
		var row = '<div class="row">';
		row += '<div class="col-xs-1"><div class="select-line" style="background:'+color+';margin: 5 0 0 3;"></div></div>';
		row += '<div class="col-xs-8" style="white-space: nowrap;">'+sheetName.replace("_", " ").toUpperCase()+'</div>';
		row += '<div class="col-xs-1"><input class="check_val" type="checkbox" line="1" value="'+sheetName+'" idx="'+(sheetTemp.length-1)+'" checked="checked"></div></div>';
		$('#road-table-div').append(row);
	}

	function addLine(sheetName,multiLine,title,color,zoom,description){
		// create dinamic description
		var str = '<hr style="color: #ddd; width: 100%; min-width: 250px; margin-top:0; margin-bottom: 8; border-style: inset; border-width: 1px;"><table style="min-width: 250px;"><tbody>';
		for(var i=0; i<Object.keys(description).length; i++){
			str += '<tr>';
			str += '<td style="width: 40%; text-transform: capitalize; padding-bottom:4px">';
			str += Object.keys(description)[i].toString().replace("Description_", "").replace(/_/g, " ");
			str += '</td>';
			str += '<td style="width: 60%; padding-bottom:4px">';
			str += description[Object.keys(description)[i]] != "" ? description[Object.keys(description)[i]] : '-' ;
			str += '</td></tr>';
		}
		str += '</tbody></table>';

		//fix title is not string
		title = title.toString();

		var wkt1 = longdo.Util.overlayFromWkt(multiLine,{
					   lineColor: color,
					   title: title,
					   visibleRange: { min: zoom, max: 20 },
					   popup: { title: title,
								detail: str,
					   			clickable:true,
					   			draggable: false}
					 });
		map.Overlays.add(wkt1[0]);
		wkt1[0].icontype = sheetName;
		wkt1[0].added = true;
		wkt1[0].id = markerTemp.length;
		markerTemp.push(wkt1[0]);
	}

	function spinLoading(){
		target = document.getElementById('loading');
		spinner = new Spinner(opts).spin(target);
		target.appendChild(spinner.el);
		$('#loading-bg').show();
	}

	function spinRemove(){
		target.children[target.children.length-1].remove();
		// check load sheet success
		if(sheetTemp.length-1 == sheetData.length){
			$('#loading-bg').hide();
		}
	}

	function addPopupMultiLine(){
		var popup = new longdo.Popup({ lon: map.location(longdo.LocationMode.Pointer).lon, lat: map.location(longdo.LocationMode.Pointer).lat },
				{
					title: 'Add new line',
					detail: lineCount,
					loadDetail: updateLine,
				 	size: { width: 360 },
           			visibleRange: { min: 10, max: 20 }
				});
		map.Overlays.add(popup);
		linePopupTemp.push(popup);
	}

	function updateLine(element){
		renderLineForm(element, function() {
			createLineSelectOption(lineCount,function(n) {
				lineFormHandle(n);
				getLineDescription(n);
				setPivotLatLon(n);
				lineCount++;
			});
		});
	}

	function renderLineForm(element,callback){
        var htmlForm;
        htmlForm = '<div class="container-fluid">';
        htmlForm += '<div class="row"><div class="col-xs-3"><label>Select Type:</label></div><select class="select-type col-xs-4" id="line-select-type-'+lineCount+'"></select><div id="line-img-select-type-'+lineCount+'" class="col-xs-1"></div></div>';
        htmlForm += '<div class="row"><div class="col-xs-3"><label>Title:</label></div><input type="text" id="line-title-val-'+lineCount+'" class="col-xs-6 text"></input></div>';
        htmlForm += '<div id="line-description-zone-'+lineCount+'"></div>';
        htmlForm += '<div class="row"><div class="col-xs-3"><label>Zoom:</label></div><input type="number" id="line-zoom-val-'+lineCount+'" min="0" max="20" value="'+defaultZoom+'"></input></div>';
        htmlForm += '<div class="row hidden"><div class="col-xs-3"><label>Line:</label></div><textarea id="line-val-'+lineCount+'" class="col-xs-6" rows="6" disabled>'+longdo.Util.overlayToWkt([lineTemp[lineCount]])+'</textarea></div>';
        htmlForm += '<div class="row hidden"><div class="col-xs-3"><label>Latitude:</label></div><div class="col-xs-6" id="line-lat-val-'+lineCount+'"></div></div>';
        htmlForm += '<div class="row hidden"><div class="col-xs-3"><label>Longitude:</label></div><div class="col-xs-6" id="line-lon-val-'+lineCount+'"></div></div>';
        htmlForm += '<div class="row"><div class="col-xs-4"></div><div class="col-xs-2"><button class="btn btn-success" id="line-btn-save-'+lineCount+'" value="'+lineCount+'"><span class="glyphicon glyphicon-floppy-save" aria-hidden="true"></span> Save</button></div>';
        htmlForm += '<div class="col-xs-2"><button class="btn btn-danger" id="line-btn-delete-'+lineCount+'" value="'+lineCount+'"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span> Delete</button></div>';
        htmlForm += '</div></div>';
        element.innerHTML = htmlForm;

        //set timeout for wait create DOM
        setTimeout(function() {
        	callback();
        });
    }

    function getLineDescription(n){
        var str = '';
        for(var i=0; i<sheetTemp.length; i++){
            if(Object.keys(sheetTemp[i])[0] == $('#line-select-type-'+n).val().replace(" ", "_")){
                var listColName = sheetTemp[i].columns;
                listColName = listColName.split(",");

                for(var a=0; a<listColName.length; a++){
                    // use RegExp.test for check "Description"
                    // return ture if colomn prefix name is Description
                    if(/^Description/.test(listColName[a])){
                        str += '<div class="row">';
                        str += '<div class="col-xs-3"><label style="text-transform: capitalize;">'+listColName[a].toString().replace("Description_", "").replace(/_/g, " ")+':</label></div>';
                        str += '<input type="text" id="line-'+listColName[a]+'-'+n+'" class="col-xs-6 text"></input>';
                        str += '</div>';
                    }
                }
            }
        }
        $("#line-description-zone-"+n).html(str);
    }

    function createLineSelectOption(n,callback){
		for(var i=0; i<$("#road-table-div").children().length; i++){
            sheetName = $($("#road-table-div").children()[i].children[1]).html();
            str = sheetName.toLowerCase();
            str= str.split(" ");
            //don't check line
            if(str[1] == "lines"){
                $('#line-select-type-'+n).append($('<option>', {
                    value: sheetName,
                    text: sheetName
                }));
            }
        }

        getImgLineFromSelectType(n,$('#line-select-type-'+n).val());
        callback(n);
    }

    function setPivotLatLon(n){
		$('#line-lat-val-'+n).html(lineTemp[n].pivot().lat);
		$('#line-lon-val-'+n).html(lineTemp[n].pivot().lon);
	}

    function lineFormHandle(n){
    	$('#line-select-type-'+n).change(function(){
    		getImgLineFromSelectType(n,$('#line-select-type-'+n).val());
    	});

		$('#line-btn-save-'+n).click(function() {
			$("#line-btn-save-"+n).prop('disabled', true);
			// create data json for send to setSpreadSheet
    		var data =  getLineData(n);

            setSpreadSheet(data,n, function(data,n){
                map.Overlays.remove(lineTemp[n]);
    			map.Overlays.remove(linePopupTemp[n]);
                addLine(data.sheetName,data.line,data.title,data.color,data.zoom,descriptFilterOfPin(data));
            });
    	});

    	$('#line-btn-delete-'+n).click(function() {
    		map.Overlays.remove(lineTemp[n]);
    		map.Overlays.remove(linePopupTemp[n]);
    		lineTemp.pop();
    		linePopupTemp.pop();
    	});

    	
    }

    function getLineData(n){
    	// split white space
		var str = $("#line-select-type-"+n).val();
		str = str.split(" ");
		str = str[0]+"_"+str[1];

    	// split colon symbol
		var color = $('#line-img-select-type-'+n).children().attr('style');
		color = color.split(":");
		color = color[1];

    	var data =  {
                        sheetName: str,
                        title: $("#line-title-val-"+n).val(),
                        color: color,
                        zoom: $("#line-zoom-val-"+n).val(),
                        line: $('#line-val-'+n).val(),
                        latitude: $('#line-lat-val-'+n).text(),
                        longitude: $('#line-lon-val-'+n).text()
                    };

        for(var i=0; i<sheetTemp.length; i++){
            if(Object.keys(sheetTemp[i])[0] == $("#line-select-type-"+n).val().replace(" ", "_")){
                var listColName = sheetTemp[i].columns;
                listColName = listColName.split(",");

                for(var a=0; a<listColName.length; a++){
                    if(/^Description/.test(listColName[a])){
                        data[listColName[a]] = $("#line-"+listColName[a]+'-'+n).val();
                    }
                }
            }
        }
        return data;
    }

    function getImgLineFromSelectType(n,sheetName){
        for(var i=0; i<$('#road-table-div')[0].children.length; i++){
            //don't check line
            if($($('#road-table-div')[0].children[i].children[1]).text() == sheetName){
                $("#line-img-select-type-"+n).html($($('#road-table-div')[0].children[i].children[0]).html());
            }
        }
    }

    function searchMarker(id){
    	// in ES6 can use Default Parameters (id = -1) but now don't support in safari
    	// This probleam is solved by this solution
    	id = typeof id !== 'undefined' ? id : -1;
    	if(id == -1){
    		for(var i=0; i<markerTemp.length; i++){
    			if(markerTemp[i] != undefined){
					if( markerTemp[i].title == $('#data-search').val() || searchDescriptionMarker(markerTemp[i].description)){
						markerTemp[i].pop(true);
						if(markerTemp[i].location().length === undefined){
							map.location(markerTemp[i].location());
						}else{
							map.location(markerTemp[i].pivot());
						}
						return;
					}
				}
			}
    	}else{
    		for(var i=0; i<markerTemp.length; i++){
    			if(markerTemp[i] != undefined){
					if(markerTemp[i].id == id){
						markerTemp[i].pop(true);
						if(markerTemp[i].location().length === undefined){
							map.location(markerTemp[i].location());
						}else{
							map.location(markerTemp[i].pivot());
						}
						return;
					}
				}
			}
    	}
    }

    function searchDescriptionMarker(m, regex){
    	// Default Parameters probleam is solved by this solution
    	regex = typeof regex !== 'undefined' ? regex : new RegExp('(?=.*'+$('#data-search').val()+').+', 'ig');
    	for(index in m){
		    if(regex.test(m[index])){
				return true;
		    }
		}
		return false;
    }

    function suggestSearch(){
    	$('#suggest-search').html(null);
    	var data = $('#data-search').val();
    	data = data.split(" ");

    	if(data.length == 1){
	    	for(var i=0; i<markerTemp.length; i++){
	    		var regex = new RegExp('(?=.*'+data[0]+').+', 'ig');
	    		if(markerTemp[i] != undefined && markerTemp[i].title != undefined){
	    			if(regex.test(markerTemp[i].title) || searchDescriptionMarker(markerTemp[i].description)){
						// limit suggest data is 10
						if($('#suggest-search tbody tr').length < 10){
							$('#suggest-search').append('<tr><td class="suggestSearch" idx="'+markerTemp[i].id+'">'+markerTemp[i].title+'</td></tr>');
						}
					}
	    		}
			}	
    	}else if(data.length > 0){
    		// create Regax condition to string because Dynamic condition
    		var strRegex = '';

    		for(var a=0; a<data.length; a++){
    			var regex = new RegExp('(?=.*'+data[a]+').+', 'ig');
    			strRegex += "("+regex.toString()+".test(markerTemp[i].title) || searchDescriptionMarker(markerTemp[i].description, "+regex.toString()+"))";
    			if(a != data.length-1){
    				strRegex += "&&";
    			}
			}

    		for(var i=0; i<markerTemp.length; i++){
				if(markerTemp[i] != undefined && markerTemp[i].title != undefined){
	    			if(eval(strRegex)){
	    				// limit suggest data is 10
	    				if($('#suggest-search tbody tr').length < 10){
							$('#suggest-search').append('<tr><td class="suggestSearch" idx="'+markerTemp[i].id+'">'+markerTemp[i].title+'</td></tr>');
						}
					}
	    		}
			}
    	}
    	// set first suggest to suggestIndex
    	suggestIndex = $('.suggestSearch').first();
    }

    function screenHandle(){
		//	check this is position is mobile screen
		if($('#search').position().top == 57){
			$('#map').css("height",$('body').height() - $('#header').outerHeight()-$('#search').outerHeight());
		}else{
			$('#map').css("height",$('body').height() - $('#header').outerHeight());
		}
		$('#loading-bg').css("height",$('body').height() - $('#header').outerHeight());

		$(window).resize(function() {
			//	check this is position is mobile screen
			if($('#search').position().top == 57){
				$('#map').css("height",$('body').height() - $('#header').outerHeight()-$('#search').outerHeight());
			}else{
				$('#map').css("height",$('body').height() - $('#header').outerHeight());
			}
			$('#loading-bg').css("height",$('body').height() - $('#header').outerHeight());
		});


	}

// Event Listener Zone
$(function(){

	init();
	screenHandle();

	getSheetName(function(sheetData){
		for(var i=0; i<sheetData.length; i++){
			addSheet(sheetData[i].sheetName);
		}
	});

	$("#road-container").delegate(".check_val", "click", function() {
		if($(this).attr('line') == 1){
			if($(this).is(":checked")){
				for(var i=0; i<sheetTemp[$(this).attr('idx')][$(this).val()].length; i++){
					if(!!sheetTemp[$(this).attr('idx')][$(this).val()][i]['Line']){
						addLine($(this).val(), sheetTemp[$(this).attr('idx')][$(this).val()][i]['Line'], sheetTemp[$(this).attr('idx')][$(this).val()][i]['Title'], sheetTemp[$(this).attr('idx')][$(this).val()][i]['color'], sheetTemp[$(this).attr('idx')][$(this).val()][i]['Zoom'], descriptFilter($(this).val(),sheetTemp[$(this).attr('idx')],i));
					}
				}
			}else{
				deleteMarker($(this).val());
			}
		}else{
			if($(this).is(":checked")){
				jsonToMarker($(this).val(), sheetTemp[$(this).attr('idx')]);
			}else{
				deleteMarker($(this).val());
			}
		}
		
	});

	$('#road-topic').click(function() {
		if($('#road-table-div').is(":visible")){
			$('#road-table-div').hide('fast');
			$('#road-topic-span').removeClass("glyphicon-chevron-up");
			$('#road-topic-span').addClass("glyphicon-chevron-down");
		}else{
			$('#road-table-div').show('fast');
			$('#road-topic-span').removeClass("glyphicon-chevron-down");
			$('#road-topic-span').addClass("glyphicon-chevron-up");
		}
	});

	$('#btn-search').click(function() {
		searchMarker();
		$('#suggest-search').hide();
	});

	$('#data-search').keyup(function(event) {
		if(event.keyCode == 13){
			if($('.suggestSearch.active').html() == undefined){
				searchMarker();
				$('#suggest-search').hide();
			}else{
				searchMarker($('.suggestSearch.active').attr('idx'));
				$('#data-search').val($('.suggestSearch.active').html());
				$('#suggest-search').hide();
			}
		}else if(event.keyCode == 8){
			if($('#data-search').val() == ""){
				$('#remove-search').hide();
				$('#suggest-search').hide();
			}else{
				$('#remove-search').show();
				$('#suggest-search').show();
				suggestSearch();
			}
		}else if(event.keyCode == 40 || event.keyCode == 38){
			$('#suggest-search').show();
			$('#remove-search').show();
		}else{
			$('#suggest-search').show();
			$('#remove-search').show();
			suggestSearch();
		}
	});

	$('#data-search').keydown(function(){
		if(event.keyCode == 40){			//key down
			if($('.suggestSearch.active').parent().index() < 0){
				suggestIndex = $('.suggestSearch').first();
				suggestIndex.addClass('active');
			}else if($('.suggestSearch.active').parent().index() != $('.suggestSearch').length-1){
				suggestIndex.removeClass('active');
				suggestIndex = $(suggestIndex.parent().next()).children();
				suggestIndex.addClass('active');
				//scroll down
				$('#suggest-search tbody').scrollTop($('#suggest-search tbody').scrollTop() + ($('.suggestSearch.active').parent().prev().height() == null ? 34 : $('.suggestSearch.active').parent().prev().height()));
			}
		}else if(event.keyCode == 38){		//key up
			if($('.suggestSearch.active').parent().index() != 0){
				suggestIndex.removeClass('active');
				suggestIndex = $(suggestIndex.parent().prev()).children();
				suggestIndex.addClass('active');
				//scroll up
				$('#suggest-search tbody').scrollTop($('#suggest-search tbody').scrollTop() - ($('.suggestSearch.active').parent().next().height() == null ? 34 : $('.suggestSearch.active').parent().next().height()));
			}
		}
	});

	$('#data-search').click(function(){
		if($('#data-search').val() == ""){
			$('#suggest-search').html(null);
		}else{
			suggestSearch();
			$('#suggest-search').show();
		}
	});

	$("#suggest-search").delegate(".suggestSearch", "click", function(){
		$('#data-search').val($(this).html());
		$('#suggest-search').hide();
		searchMarker($(this).attr('idx'));
	});

	$('#remove-search').click(function() {
		$('#data-search').val(null);
		$('#suggest-search').html(null);
		$('#remove-search').hide();
		$('#suggest-search').hide();
	});

	$('#map').click(function(){
		$('#suggest-search').hide();
	});
});







