// Initialization of the dashboard and DB connections.
	var blessed = require('blessed')
     , contrib = require('blessed-contrib')
     , screen = blessed.screen()


	const sqlite3 = require('sqlite3').verbose();
	
// Open SQLite database in memory
	var db = new sqlite3.Database('./acog.db', sqlite3.OPEN_READWRITE, (err) => {
  		if (err) {
    		return console.error(err.message);
  		}
  	console.log('Connected to the in-memory SQlite database.');
	});


// Main visualizations

	// Create a random color
	function randomColor() {
    	return [Math.random() * 255,Math.random()*255, Math.random()*255]
	}
 
// Set up the grid 
    var grid = new contrib.grid({rows: 12, cols: 12, screen: screen})

// Add the donut for progress
    var donut = grid.set(8, 8, 4, 2, contrib.donut, 
      {
      label: 'Readiness to Full Launch',
      radius: 16,
      arcWidth: 4,
      yPadding: 2,
      data: [{label: 'Percentage', percent: 0}]
    })

// Make gauges
    var gauge = grid.set(8, 10, 2, 2, contrib.gauge, {label: 'Casualty Rate', percent: [0,100]})
    var gauge_two = grid.set(2, 9, 2, 3, contrib.gauge, {label: 'Troop Deployment', percent: 0})
    
// Add Sparkline graph
    var sparkline = grid.set(10, 10, 2, 2, contrib.sparkline, 
      { label: 'Data integrity'
      , tags: true
      , style: { fg: 'blue', titleFg: 'white' }})
    
// Add bar graph
    var bar = grid.set(4, 6, 4, 3, contrib.bar, 
      { label: 'Mainframe Utilization (%)'
      , barWidth: 4
      , barSpacing: 6
      , xOffset: 2
      , maxHeight: 9})
    
// Add grid for processes
    var table =  grid.set(4, 9, 4, 3, contrib.table, 
      { keys: true
      , fg: 'green'
      , label: 'Active situations'
      , columnSpacing: 1
      , columnWidth: [24, 10, 10]})

// Add LCD field
    var lcdLineOne = grid.set(0,9,2,3, contrib.lcd,
      {
        label: "Status",
        segmentWidth: 0.06,
        segmentInterval: 0.11,
        strokeWidth: 0.1,
        elements: 5,
        display: 3210,
        elementSpacing: 4,
        elementPadding: 2
      }
    );
    
// Add Error section
    var errorsLine = grid.set(0, 6, 4, 3, contrib.line, 
      { style: 
        { line: randomColor()
        , text: randomColor()
        , baseline: randomColor()}
      , label: 'Cyberwar Anomaly Detected'
      , maxY: 60
      , showLegend: true })


// Add online logging.
    var transactionsLine = grid.set(0, 0, 6, 6, contrib.line, 
      { fg: randomColor()
      , selectedFg: randomColor()
      , label: 'Message Log'})
        
// Add Message Log
    var log = grid.set(0, 0, 6, 6, contrib.log, 
      { fg: 'green'
      , tags: true
      , selectedFg: randomColor()
      , label: 'Message Log'})
    
// Add Anomaly Detection Map
    var map = grid.set(6, 0, 6, 6, contrib.map, {label: 'Anomaly Detected. Possible Launch.'})

// Add Message Log
    var statusLog = grid.set(8, 6, 4, 2, contrib.log, 
      { fg: 'red'
      , tags: true      
      , selectedFg: randomColor()
      , tags: true
      , label: 'Status Log'})
    
    
// ALL OF THIS IS CRAPPY DATA FOR NOW
    //dummy data
    var servers = ['US1', 'US2', 'EU1', 'AU1', 'AS1', 'JP1']
    var commands = ['Silo Activity Detected', 'Military Casualty', 'CommLoss with Unit', 'Potential Enemy Sighting']
    
    
    //Casualty rate
    var gauge_percent = 0
    setInterval(function() {
	    var sql = 'SELECT value value FROM gauges where name = "casualties"';
 		db.all(sql, [], (err, rows) => {
		if (err) {
    		throw err;
  		}
  		rows.forEach((row) => {
    		gauge.setData([row.value, 100-row.value])
			});
		});
    }, 1000)
    
    // Troop Deployment
    var gauge_percent_two = 0
    setInterval(function() {
	    var sql = 'SELECT value value FROM gauges where name = "deployment"';
 		db.all(sql, [], (err, rows) => {
		if (err) {
    		throw err;
  		}
  		rows.forEach((row) => {
            gauge_two.setData(row.value);
			});
		});
    }, 1000);
    
    
    //set dummy data on bar chart
    function fillBar() {
      var arr = []
      for (var i=0; i<servers.length; i++) {
        arr.push(Math.round(Math.random()*10))
      }
      bar.setData({titles: servers, data: arr})
    }
    fillBar()
    setInterval(fillBar, 2000)
    
    
    //set dummy data for table
    function generateTable() {
       var data = []
    
       for (var i=0; i<30; i++) {
         var row = []          
         row.push(commands[Math.round(Math.random()*(commands.length-1))])
         row.push(Math.round(Math.random()*10000))
         row.push(Math.round(Math.random()*3))
    
         data.push(row)
       }
    
       table.setData({headers: ['Message', 'ID', 'Count'], data: data})
    }
    // Generate the Table and set it as the scroll focus
    generateTable()
    table.focus()
    setInterval(generateTable, 3000)
    
    
    //set log dummy data
    setInterval(function() {
    	var sql = 'SELECT text text FROM logs where enabled = 1';
 		db.all(sql, [], (err, rows) => {
		if (err) {
    		throw err;
  		}
  		rows.forEach((row) => {
    		log.log(row.text);
			});
		});
       screen.render()
    }, 5000)


    //set status dummy data
    setInterval(function() {
    	var sql = 'SELECT text text FROM status where enabled = 1';
 		db.all(sql, [], (err, rows) => {
		if (err) {
    		throw err;
  		}
  		rows.forEach((row) => {
    		statusLog.log(row.text);
			});
		});
       screen.render()
    }, 5000)    
    
    //set spark dummy data
    var spark1 = [1,2,5,2,1,5,1,2,5,2,1,5,4,4,5,4,1,5,1,2,5,2,1,5,1,2,5,2,1,5,1,2,5,2,1,5]
    var spark2 = [4,4,5,4,1,5,1,2,5,2,1,5,4,4,5,4,1,5,1,2,5,2,1,5,1,2,5,2,1,5,1,2,5,2,1,5]
    
    refreshSpark()
    setInterval(refreshSpark, 1000)
    
    function refreshSpark() {
      spark1.shift()
      spark1.push(Math.random()*5+1)       
      spark2.shift()
      spark2.push(Math.random()*5+1)       
      sparkline.setData(['Server1', 'Server2'], [spark1, spark2])  
    }
    
    
    
    //set map dummy markers
    var marker = true
    setInterval(function() {
    	if (marker) {
			var sql = 'SELECT latitude lat, longitude lon FROM geolocation where enabled = 1';
 			db.all(sql, [], (err, rows) => {
			if (err) {
    			throw err;
  			}
  			rows.forEach((row) => {
    			map.addMarker({"lon" :row.lon, "lat" :row.lat, color: "red", char: 'X' })
  				});
			});
		}
       	else {
        	map.clearMarkers()
       	}
       	marker =! marker
       	screen.render()
    }, 1000)
    
    //set line charts dummy data
    
    var transactionsData = {
       title: 'USA',
       style: {line:'red'},
       x: ['00:00', '00:05', '00:10', '00:15', '00:20', '00:30', '00:40', '00:50', '01:00', '01:10', '01:20', '01:30', '01:40', '01:50', '02:00', '02:10', '02:20', '02:30', '02:40', '02:50', '03:00', '03:10', '03:20', '03:30', '03:40', '03:50', '04:00', '04:10', '04:20', '04:30'],
       y: [0, 20, 40, 45, 45, 50, 55, 70, 65, 58, 50, 55, 60, 65, 70, 80, 70, 50, 40, 50, 60, 70, 82, 88, 89, 89, 89, 80, 72, 70]
    }
    
    var transactionsData1 = {
       title: 'Europe',
       style: {line:'yellow'},
       x: ['00:00', '00:05', '00:10', '00:15', '00:20', '00:30', '00:40', '00:50', '01:00', '01:10', '01:20', '01:30', '01:40', '01:50', '02:00', '02:10', '02:20', '02:30', '02:40', '02:50', '03:00', '03:10', '03:20', '03:30', '03:40', '03:50', '04:00', '04:10', '04:20', '04:30'],
       y: [0, 5, 5, 10, 10, 15, 20, 30, 25, 30, 30, 20, 20, 30, 30, 20, 15, 15, 19, 25, 30, 25, 25, 20, 25, 30, 35, 35, 30, 30]
    }
    
    var errorsData = {
       title: 'US CYBERCOM',
       x: ['00:00', '00:05', '00:10', '00:15', '00:20', '00:25'],
       y: [30, 50, 70, 40, 50, 20]
    }
    
    var latencyData = {
       x: ['t1', 't2', 't3', 't4'],
       y: [5, 1, 7, 5]
    }
    
    setLineData([transactionsData, transactionsData1], transactionsLine)
    setLineData([errorsData], errorsLine)
    // setLineData([latencyData], latencyLine)
    
    setInterval(function() {
       setLineData([transactionsData, transactionsData1], transactionsLine)
       screen.render()
    }, 500)
    
    setInterval(function() {   
        setLineData([errorsData], errorsLine)
    }, 1500)
    
    setInterval(function(){
      var colors = [randomColor(),randomColor(),randomColor(),randomColor(),randomColor()];
      var text = ['A','B','C','D','E','F','G','H','I','J','K','L'];
    
      var value = Math.round(Math.random() * 100);
      lcdLineOne.setDisplay(value + text[value%12]);
      lcdLineOne.setOptions({
        color: colors[value%5],
        elementPadding: 4
      });
      screen.render()
    }, 1500);


//UPDATE METHODS
    var pct = 0.00;

    function updateDonut(){
      if (pct > 0.99) pct = 0.00;
      var color = "green";
      if (pct >= 0.25) color = "cyan";
      if (pct >= 0.5) color = "yellow";
      if (pct >= 0.75) color = "red";  
      donut.setData([
        {percent: parseFloat((pct+0.00) % 1).toFixed(2), label: 'Percentage', 'color': color}
      ]);
      pct += 0.01;
    }
        
    setInterval(function() {   
       updateDonut();
       screen.render()
    }, 10000)    
        
    function setLineData(mockData, line) {
      for (var i=0; i<mockData.length; i++) {
        var last = mockData[i].y[mockData[i].y.length-1]
        mockData[i].y.shift()
        var num = Math.max(last + Math.round(Math.random()*10) - 5, 10)    
        mockData[i].y.push(num)  
      }
      
      line.setData(mockData)
    }    
    
    // Escape Conditions
	screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    
		// close the database connection
		db.close((err) => {
  			if (err) {
    			return console.error(err.message);
  			}
  		console.log('Close the database connection.');
		});	
		return process.exit(0);
	});
 
 	//Render the screen
   	screen.render()