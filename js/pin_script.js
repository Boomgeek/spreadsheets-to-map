var pinCount = 0;
var pinTemp = [];

    // Global function
    function addPin(lon,lat){
        var pin = new longdo.Marker({ lon: lon, lat: lat },
        {
            title: 'Add new location',
            detail: ""+pinCount,
            loadDetail: updateDetail,
            icon: {
                url: 'http://map.longdo.com/mmmap/images/pin_mark.png',
                offset: { x: 10, y: 40 }
            },
            size: { width: 360 },
            draggable: true
        });
        pin.id = pinCount;
        pinTemp.push(pin);
        map.Overlays.add(pin);
        pin.pop();
    }

    function updateDetail(element){
       var num = $(element).html();
       if(!isNaN(num)){
            renderPinForm(element, function(){
                createSelectOption(num,function(n) {
                    pinFormHandle(n); 
                    // call this function after create select option
                    getImgFromSelectType(n,$('#select-type-'+n).val());
                    getDescription(n);
                    // create first lat and lon
                    $("#lat-val-"+n).html(pinTemp[n].location().lat);
                    $("#lon-val-"+n).html(pinTemp[n].location().lon);
                    $("#location-latlon-val-"+n).html(pinTemp[n].location().lat.toFixed(6));
                    $("#location-latlon-val-"+n).append(", "+pinTemp[n].location().lon.toFixed(6));
                    // create first address
                    map.Search.address.id = n;
                    map.Search.address({lat:pinTemp[n].location().lat, lon:pinTemp[n].location().lon});
                });
            });
       }
    }

    function renderPinForm(element,callback){
        var htmlForm;
        htmlForm = '<div id="pin-container" class="container-fluid">';
        htmlForm += '<div class="row"><div class="col-xs-4"><label>Select Type:</label></div><select class="select-type col-xs-3" id="select-type-'+pinCount+'"></select><div id="img-select-type-'+pinCount+'" class="col-xs-2"></div></div>';
        htmlForm += '<div class="row"><div class="col-xs-4"><label>Title:</label></div><input type="text" id="title-val-'+pinCount+'" class="col-xs-5 text"></input></div>';
        htmlForm += '<div id="description-zone-'+pinCount+'"></div>';               
        htmlForm += '<div class="row" hidden><div class="col-xs-4"><label>Latitude:</label></div><div class="col-xs-5" id="lat-val-'+pinCount+'"></div></div>';
        htmlForm += '<div class="row" hidden><div class="col-xs-4"><label>Longitude:</label></div><div class="col-xs-5" id="lon-val-'+pinCount+'"></div></div>';
        htmlForm += '<div class="row"><div class="col-xs-4"><label>Zoom:</label></div><input type="number" id="zoom-val-'+pinCount+'" min="0" max="20" value="'+defaultZoom+'"></input></div>';
        htmlForm += '<div class="row"><div class="col-xs-4"><label>Location:</label></div><div style="padding: 0;" class="col-xs-6" id="location-latlon-val-'+pinCount+'"></div></div>';
        htmlForm += '<div class="row"><div class="col-xs-4"></div><div class="col-xs-2"><button class="btn btn-success" id="btn-save-'+pinCount+'" value="'+pinCount+'"><span class="glyphicon glyphicon-floppy-save" aria-hidden="true"></span> Save</button></div>';
        htmlForm += '<div class="col-xs-2"><button class="btn btn-danger" id="btn-delete-'+pinCount+'" value="'+pinCount+'"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span> Delete</button></div>';
        htmlForm += '</div></div>';
        pinCount++;
        element.innerHTML = htmlForm;
        callback();
    }

    function createSelectOption(n,callback){
        for(i=0; i<$("#road-table-div").children().length; i++){
            sheetName = $($("#road-table-div").children()[i].children[1]).html();
            str = sheetName.toLowerCase();
            str= str.split(" ");
            //don't check line
            if(str[1] != "lines"){
                $('#select-type-'+n).append($('<option>', {
                    value: sheetName,
                    text: sheetName
                }));
            }
        }
        callback(n);
    }

    function pinFormHandle(n){
        //select-type Handle
        $("#select-type-"+n).change(function() {
            getImgFromSelectType(n,$("#select-type-"+n).val());
            getDescription(n);
            // Handle address
            map.Search.address.id = n;
            map.Search.address({lat:pinTemp[n].location().lat, lon:pinTemp[n].location().lon});
        });

        //delete button Handle
        $("#btn-delete-"+n).click(function() {
            map.Overlays.remove(pinTemp[n]);
        });
        
        //save button Handle
        $("#btn-save-"+n).click(function() {
            $("#btn-save-"+n).prop('disabled', true);           // save one time only.

            var data = getPinData(n);

            setSpreadSheet(data,n, function(data,n){
                map.Overlays.remove(pinTemp[n]);
                addMarker(data.sheetName, data.icon, data.title, descriptFilterOfPin(data), data.zoom, data.latitude, data.longitude);
            });

        });
    }

    function descriptFilterOfPin(data){
        var descriptionObj = {};
        for(var i=0; i<Object.keys(data).length; i++){
            if(/^Description/.test(Object.keys(data)[i])){
                descriptionObj[Object.keys(data)[i]] = data[Object.keys(data)[i]];
            }
        }
        return descriptionObj;
    }

    function getPinData(n){
        var data =  {
                        sheetName: $("#select-type-"+n).val(),
                        title: $("#title-val-"+n).val(),
                        latitude: $("#lat-val-"+n).text(),
                        longitude: $("#lon-val-"+n).text(),
                        icon: $("#img-select-type-"+n).children().attr("src"),
                        zoom: $("#zoom-val-"+n).val()
                    };
        for(var i=0; i<sheetTemp.length; i++){
            if(Object.keys(sheetTemp[i])[0] == $("#select-type-"+n).val()){
                var listColName = sheetTemp[i].columns;
                listColName = listColName.split(",");

                for(var a=0; a<listColName.length; a++){
                    // use RegExp.test for check "Description"
                    // return ture if colomn prefix name is Description
                    if(/^Description/.test(listColName[a])){
                        data[listColName[a]] = $("#"+listColName[a]+'-'+n).val();
                    }
                }
            }
        }
        return data;
    }

    function getDescription(n){
        var str = '';
        for(var i=0; i<sheetTemp.length; i++){
            if(Object.keys(sheetTemp[i])[0] == $('#select-type-'+n).val()){
                var listColName = sheetTemp[i].columns;
                listColName = listColName.split(",");

                for(var a=0; a<listColName.length; a++){
                    // use RegExp.test for check "Description"
                    // return ture if colomn prefix name is Description
                    if(/^Description/.test(listColName[a])){
                        str += '<div class="row">';
                        str += '<div class="col-xs-4"><label style="text-transform: capitalize;">'+listColName[a].toString().replace("Description_", "").replace(/_/g, " ")+':</label></div>';
                        str += '<input type="text" id="'+listColName[a]+'-'+n+'" class="col-xs-5 text"></input>';
                        str += '</div>';
                    }
                }
            }
        }
        $("#description-zone-"+n).html(str);
    }

    function getImgFromSelectType(n,sheetName){
        for(i=0; i<$('#road-table-div')[0].children.length; i++){
            //don't check line
            if($($('#road-table-div')[0].children[i].children[1]).text() == sheetName){
                $("#img-select-type-"+n).html($($('#road-table-div')[0].children[i].children[0]).html());
            }
        }
    }

    function setSpreadSheet(data,n,callback){
        spinLoading();
        if(data.line){
            var d = "&mode=set&sheetname="+data.sheetName+"&Title="+data.title+"&color="+data.color+"&Zoom="+data.zoom+"&Line="+data.line+"&Latitude="+data.latitude+"&Longitude="+data.longitude;
            for(var i=0; i<Object.keys(data).length; i++){
                if(/^Description/.test(Object.keys(data)[i])){
                    d += '&'+Object.keys(data)[i]+'='+data[Object.keys(data)[i]];
                }
            }
        }else{
            var d = "&mode=set&sheetname="+data.sheetName+"&Title="+data.title+"&Latitude="+data.latitude+"&Longitude="+data.longitude+"&Icon="+data.icon+"&Zoom="+data.zoom;
            for(var i=0; i<Object.keys(data).length; i++){
                if(/^Description/.test(Object.keys(data)[i])){
                    d += '&'+Object.keys(data)[i]+'='+data[Object.keys(data)[i]];
                }
            }
        }
        $.ajax({
            url: sheetAPI,
            type: "GET",
            data: d,
            success: function(res){
                //console.log(res);
                spinRemove();
                callback(data,n);
            }
        });
    }

// Event Listener Zone
$(function(){
    $('#btn-pin').click(function(){
        addPin(map.location().lon, map.location().lat);
    });

    $('#btn-pin').draggable({
        containment: "#map",
        scroll: false,
        cursorAt: {top: 70, left: 28},
        helper: "clone",
        revert: "invalid",
        start: function(){
            $("#btn-pin").hide();
        },
        drag: function(){
            
        },
        stop: function(){
            $("#btn-pin").show("slow");
        }
    });

    $('#map').droppable({
        accept: "#btn-pin",
        drop: function(event, ui){
            addPin(map.location(longdo.LocationMode.Pointer).lon, map.location(longdo.LocationMode.Pointer).lat);
            map.bound({
              minLon: map.location(longdo.LocationMode.Pointer).lon, minLat: map.location(longdo.LocationMode.Pointer).lat,
              maxLon: map.location(longdo.LocationMode.Pointer).lon+0.1, maxLat: map.location(longdo.LocationMode.Pointer).lat+0.1
            });
        }
    });
});