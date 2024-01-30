const url = "https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json";

// Define optionChanged function
function optionChanged(selectedValue) {
    modifyDashboard(selectedValue);
}

// Wrap your entire D3 JSON loading code in a function
function loadData() {
    d3.json(url).then(function(data) {
        // Confirming the data was migrated correctly
        console.log(data);

        // Extracting each subset to a variable
        let samples = data.samples;
        let names = data.names;
        let metadata = data.metadata;

        // TREATING THE SAMPLES DATA SUBSET
        sampleData = samples.map(sample => ({
            'id': sample.id,
            'otu_id': sample.otu_ids,
            'otu_labels': sample.otu_labels,
            'sample_values': sample.sample_values
        }));

        // Confirming sample data creation
        console.log(sampleData);

        // TREATING THE NAMES ARRAY
        const selectElement = document.getElementById("selDataset");
        names.forEach(name => {
            const option = document.createElement('option');
            option.text = name;
            option.value = name;
            selectElement.appendChild(option);
        });

        // Calling the name array
        console.log(names);

        // TREATING THE METADATA ARRAY
        metaField = metadata.map(field => ({
            'id': field.id.toString(),
            'ethnicity': field.ethnicity,
            'gender': field.gender,
            'age': field.age,
            'location': field.location,
            'bbtype': field.bbtype,
            'wfreq': field.wfreq
        }));

        // Call modifyChart to initialize the chart
        modifyDashboard(names[0]);
    }).catch(function(error) {
        console.log('Error loading the JSON file: ' + error);
    });
}

// Call the function to load data when the script is executed
loadData();

// Rest of your code
function modifyDashboard(selectedValue) {
    // Update charts and metadata based on the selected ID
    let selectedSample = sampleData.find(sample => sample.id === selectedValue);

    // Create bar chart
    let trace1 = {
        x: selectedSample.sample_values.slice(0, 10).sort((a, b) => a - b),
        y: selectedSample.otu_id.slice(0, 10).map(id => `OTU ${id}`).reverse(),
        text: selectedSample.otu_labels.slice(0, 10),
        type: 'bar',
        orientation: 'h',
        marker: {
            color: '#E32754',
            opacity: 0.75
        }
    };
    let hBarChart = [trace1];

    let layout = {
        margin: {
            l: 80,
            r: 55,
            t: 35,
            pad: 5
        },
        title: {
            text: `<b>Top 10 OTUs - Sample ${selectedValue} </b>`,
            font: {
                size: 22
            }
        }
    };

    Plotly.newPlot('bar', hBarChart, layout);

    // Create bubble chart
    let trace2 = { 
        x: selectedSample.otu_id,
        y: selectedSample.sample_values,
        mode: 'markers',
        text:selectedSample.otu_labels,
        marker: {
            color: selectedSample.otu_id,
            size: selectedSample.sample_values
        }
    };

    let bubbleChart = [trace2];

    let bubbleLayout = {
        showlegend: false,
        height: 600,
        width: 1200,
        title: {
            text: `<b>Sample distribution of sample ${selectedValue}</b>`,
            font: {
                size: 22
            }
        },
        xaxis: {
            title: {
                text: "OTU IDs"
            }
        },
        yaxis: {
            title: {
                text: 'Sample Values'
            }
        }
    };

    Plotly.newPlot('bubble', bubbleChart, bubbleLayout);

    // Append Demographic information
    let selectedMetadata = metaField.find(field => field.id === selectedValue);
    let panelBody = d3.select('.panel-body');
    panelBody.html(`
        <p><strong>Id:</strong> ${selectedMetadata.id}</p>
        <p><strong>Ethnicity</strong>: ${selectedMetadata.ethnicity}</p>
        <p><strong>Gender:</strong> ${selectedMetadata.gender}</p>
        <p><strong>Age:</strong> ${selectedMetadata.age}</p>
        <p><strong>Location:</strong> ${selectedMetadata.location}</p>
        <p><strong>BBType:</strong> ${selectedMetadata.bbtype}</p>
        <p><strong>WFreq:</strong> ${selectedMetadata.wfreq}</p>
    `);

    // Create gauge chart
    let wfreqValue = selectedMetadata.wfreq;

    let gaugeData = [
        {
            domain: { x: [0, 1], y: [0, 1] },
            title: {
                text: "<b>Belly Button Washing Frequency</b><br><span style='font-size: 20px;'>Scrubs per Week</span>",
                font: { size: 22 }
            },
            type: "indicator",
            mode: "gauge+number",
            value: wfreqValue,
            gauge: {
                axis: { range: [0, 9], tickwidth: 1, tickcolor: 'red'},
                bar: {color: '#430304' },
                bgcolor: "white",
                borderwidth: 2,
                bordercolor: "gray",
                steps: [
                    { range: [0, 1], color: "#f89091" },
                    { range: [1, 2], color: "#f66e6f" },
                    { range: [2, 3], color: "#f44c4e" },
                    { range: [3, 4], color: "#f22a2c" },
                    { range: [4, 5], color: "#ec0d0f" },
                    { range: [5, 6], color: "#ca0b0d" },
                    { range: [6, 7], color: "#a8090b" },
                    { range: [7, 8], color: "#860708" },
                    { range: [8, 9], color: "#650506" }
                ]
            }
        }
    ];

    let layout2 = {
        width: 520,
        height: 500,
        margin: { t: 0, b: 145, pad: 8 }
    };

    Plotly.newPlot('gauge', gaugeData, layout2);
}
