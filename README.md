# Spreadsheets to map
## Description
This project show marker on [Longdo Map API](http://map.longdo.com/longdo-map-api) by import marker data from [Google Spreadsheet](https://www.google.com/intl/th_th/sheets/about/)
## Demo
[Spreadsheet Data](https://docs.google.com/spreadsheets/d/1rVIcAH6_FaAHXr0JSxsXuEJLCBsTt7PTWqPmjlueOws/edit#gid=1414443074) <br />
[Demo](http://usermap.longdo.com/supanut/spreadsheets-to-map/)
## How to Install and Connect to Google Spreadsheet
1. Go to your Google Spreadsheet
2. In your document file menu, you'll find File Menu > Tools > Script Editor (you will be redirected to Google's script editor)
3. Copy and Paste `backend_sheet.js` to Script Editor and Save
4. You'll find Run > setup
5. Publish > Deploy as web app
 - enter Project Version name and click `Save New Version` 
 - set security level and enable service (most likely execute as `me` and access `anyone`, even `anonymously`)
6. Copy the `Current web app URL` to `var sheetAPI` in `script.js`

```
# Example
var sheetAPI = "https://script.googleusercontent.com/macros/s/AKfycbz1R9fkxqcy_aXCUCFKG8H8zdSirsA2_-Z_5qiLchQ7Gs2h1KIf/exec";
```

## Requirement in Spreadsheet
- You have to create first sheet by sheet name is `SHEET_SETTING` 
 - in this sheet must have two column only (`No.` , `Sheetname`)
 
 ```
# Example
SHEET_SETTING
+-----+-----------+
| No. | Sheetname |
+-----+-----------+
| 1   | PTT       |
+-----+-----------+
| 2   | BTS       |
+-----+-----------+
| 3   | SRT       |
+-----+-----------+
```

- In your sheets frist column is `column name` only

```
# Example
SHEET_SETTING
+-----+-----------+
| No. | Sheetname |   <----------- frist column is `column name` only
+-----+-----------+
| 1   | PTT       |
+-----+-----------+
| 2   | BTS       |
+-----+-----------+
| 3   | SRT       |
+-----+-----------+
```

- Require seven column name (`No.`, `Title`, `Latitude`, `Longitude`, `Icon`, `Zoom`, `Description`) on your other sheets

```
# Example
OTHER_SHEET
+-----+-------+----------+-----------+-----------------------------------------------+------+-------------+
| No. | Title | Latitude | Longitude | Icon                                          | Zoom | Description |
+-----+-------+----------+-----------+-----------------------------------------------+------+-------------+
| 1   | test1 | 15.19816 | 101.76340 | http://alt-gis.longdo.com/images/icon-ptt.png | 10   | bra bra bra |
+-----+-------+----------+-----------+-----------------------------------------------+------+-------------+
| 2   | test2 | 15.19816 | 101.76340 | http://alt-gis.longdo.com/images/icon-ptt.png | 10   | bra bra bra |
+-----+-------+----------+-----------+-----------------------------------------------+------+-------------+
| 3   | test3 | 15.19816 | 101.76340 | http://alt-gis.longdo.com/images/icon-ptt.png | 10   | bra bra bra |
+-----+-------+----------+-----------+-----------------------------------------------+------+-------------+
```

- if you have many `Description` in you sheet you can create column name by use underscore (`"_"`) a connector

```
# Example
OTHER_SHEET
+-----+-------+----------+-----------+-----------------------------------------------+------+---------------------+----------------------+------------------+
| No. | Title | Latitude | Longitude | Icon                                          | Zoom | Description_address | Description_priority | Description_host |
+-----+-------+----------+-----------+-----------------------------------------------+------+---------------------+----------------------+------------------+
| 1   | test1 | 15.19816 | 101.76340 | http://alt-gis.longdo.com/images/icon-ptt.png | 10   | bra bra bra         | bra bra bra          | bra bra bra      |
+-----+-------+----------+-----------+-----------------------------------------------+------+---------------------+----------------------+------------------+
| 2   | test2 | 15.19816 | 101.76340 | http://alt-gis.longdo.com/images/icon-ptt.png | 10   | bra bra bra         | bra bra bra          | bra bra bra      |
+-----+-------+----------+-----------+-----------------------------------------------+------+---------------------+----------------------+------------------+
| 3   | test3 | 15.19816 | 101.76340 | http://alt-gis.longdo.com/images/icon-ptt.png | 10   | bra bra bra         | bra bra bra          | bra bra bra      |
+-----+-------+----------+-----------+-----------------------------------------------+------+---------------------+----------------------+------------------+
```

- if you want to use line or polygon in you sheet you can create sheet name and connect `_LINES`
- in line or polygon sheet require seven column name (`No.`, `Title`, `Latitude`, `Longitude`, `Line`, `Zoom`, `Description`)

```
# Example
OTHER_LINES
+-----+-------+----------+-----------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+------+-------------+
| No. | Title | Latitude | Longitude | Line                                                                                                                                                                                                 | Zoom | Description |
+-----+-------+----------+-----------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+------+-------------+
| 1   | test1 | 15.19816 | 101.76340 | LINESTRING(100.47320410609245 13.681685281301089,100.41071936488152 13.642319447208534,100.42445227503777 13.62563702760119,100.4704575240612 13.62163307163473,100.5034165084362 13.61963106822348) | 10   | bra bra bra |
+-----+-------+----------+-----------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+------+-------------+
| 2   | test2 | 15.19816 | 101.76340 | LINESTRING(100.47320410609245 13.681685281301089,100.41071936488152 13.642319447208534,100.42445227503777 13.62563702760119,100.4704575240612 13.62163307163473,100.5034165084362 13.61963106822348) | 10   | bra bra bra |
+-----+-------+----------+-----------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+------+-------------+
| 3   | test3 | 15.19816 | 101.76340 | POLYGON((100.28454825282097 13.564736213543684,100.32025381922722 13.604782347402825,100.22824332118034 13.598108461592444,100.28454825282097 13.564736213543684))                                   | 10   | bra bra bra |
+-----+-------+----------+-----------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+------+-------------+

## Thai Document
[Thai Document](http://usermap.longdo.com/supanut/longdo-demo/#spreadsheets)
