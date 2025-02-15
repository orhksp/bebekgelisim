let heightChart, weightChart, headCircumferenceChart;

document.getElementById('addRecordBtn').addEventListener('click', function() {
    const growthRecords = document.getElementById('growthRecords');
    const recordDiv = document.createElement('div');
    
    recordDiv.innerHTML = `
        <label for="recordDate">Tarih:</label>
        <input type="date" name="recordDate" required>
        <label for="recordHeight">Boy (cm):</label>
        <input type="number" name="recordHeight" step="0.1" required>
        <label for="recordWeight">Kilo (kg):</label>
        <input type="number" name="recordWeight" step="0.1" required>
        <label for="recordHeadCircumference">Kafa Çapı (cm):</label>
        <input type="number" name="recordHeadCircumference" step="0.1" required>
    `;
    
    growthRecords.appendChild(recordDiv);
});

document.getElementById('babyForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const form = event.target;
    const records = Array.from(form.querySelectorAll('#growthRecords > div'));
    
    const labels = records.map(record => record.querySelector('input[name="recordDate"]').value);
    const heights = records.map(record => parseFloat(record.querySelector('input[name="recordHeight"]').value));
    const weights = records.map(record => parseFloat(record.querySelector('input[name="recordWeight"]').value));
    const headCircumferences = records.map(record => parseFloat(record.querySelector('input[name="recordHeadCircumference"]').value));

    console.log(labels, heights, weights, headCircumferences);

    if (heightChart) heightChart.destroy();
    if (weightChart) weightChart.destroy();
    if (headCircumferenceChart) headCircumferenceChart.destroy();
    
    heightChart = createChart('heightChart', 'Boy (cm)', labels, heights, 'blue');
    weightChart = createChart('weightChart', 'Kilo (kg)', labels, weights, 'green');
    headCircumferenceChart = createChart('headCircumferenceChart', 'Kafa Çapı (cm)', labels, headCircumferences, 'red');
});

function createChart(chartId, label, labels, data, borderColor) {
    const ctx = document.getElementById(chartId).getContext('2d');
    
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: label,
                    data: data,
                    borderColor: borderColor,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'month',
                        tooltipFormat: 'MMM yyyy'
                    }
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

document.getElementById('downloadPdfBtn').addEventListener('click', function() {
    const babyName = document.getElementById('babyName').value;
    const birthDate = document.getElementById('birthDate').value;
    const records = Array.from(document.querySelectorAll('#growthRecords > div'));
    const data = records.map(record => {
        return {
            date: record.querySelector('input[name="recordDate"]').value,
            height: record.querySelector('input[name="recordHeight"]').value,
            weight: record.querySelector('input[name="recordWeight"]').value,
            headCircumference: record.querySelector('input[name="recordHeadCircumference"]').value
        };
    });

    const heightChartDataUrl = heightChart.toBase64Image();
    const weightChartDataUrl = weightChart.toBase64Image();
    const headCircumferenceChartDataUrl = headCircumferenceChart.toBase64Image();

    const docDefinition = {
        content: [
            { text: 'Bebek Gelişim Takibi', style: 'header' },
            { text: `Bebek İsmi: ${babyName}`, style: 'subheader' },
            { text: `Doğum Tarihi: ${birthDate}`, style: 'subheader' },
            { text: 'Gelişim Verileri:', style: 'subheader' },
            {
                table: {
                    headerRows: 1,
                    widths: ['*', '*', '*', '*'],
                    body: [
                        ['Tarih', 'Boy (cm)', 'Kilo (kg)', 'Kafa Çapı (cm)'],
                        ...data.map(record => [record.date, record.height, record.weight, record.headCircumference])
                    ]
                }
            },
            { text: 'Grafikler:', style: 'subheader' },
            { image: heightChartDataUrl, width: 500 },
            { image: weightChartDataUrl, width: 500 },
            { image: headCircumferenceChartDataUrl, width: 500 }
        ]
    };

    pdfMake.createPdf(docDefinition).download('Bebek_Gelisim_Takibi.pdf');
});
