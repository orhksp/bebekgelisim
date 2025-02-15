let heightChart, weightChart, headCircumferenceChart;

document.getElementById('addRecordBtn').addEventListener('click', function() {
    const growthRecords = document.getElementById('growthRecords');
    const recordDiv = document.createElement('div');
    recordDiv.classList.add('record', 'form-group');
    
    recordDiv.innerHTML = `
        <label for="recordDate">Tarih:</label>
        <input type="date" name="recordDate" class="form-control" required>
        <label for="recordHeight">Boy (cm):</label>
        <input type="number" name="recordHeight" class="form-control" step="0.1" required>
        <label for="recordWeight">Kilo (kg):</label>
        <input type="number" name="recordWeight" class="form-control" step="0.1" required>
        <label for="recordHeadCircumference">Kafa Çapı (cm):</label>
        <input type="number" name="recordHeadCircumference" class="form-control" step="0.1" required>
        <button type="button" class="btn btn-danger deleteRecordBtn">Sil</button>
    `;
    
    growthRecords.appendChild(recordDiv);
    
    recordDiv.querySelector('.deleteRecordBtn').addEventListener('click', function() {
        growthRecords.removeChild(recordDiv);
    });
});

document.getElementById('babyForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const form = event.target;
    const birthDate = new Date(form.querySelector('input[name="birthDate"]').value);
    const gender = form.querySelector('select[name="gender"]').value;
    const records = Array.from(form.querySelectorAll('#growthRecords > .record'));
    
    const labels = records.map(record => record.querySelector('input[name="recordDate"]').value);
    const heights = records.map(record => parseFloat(record.querySelector('input[name="recordHeight"]').value));
    const weights = records.map(record => parseFloat(record.querySelector('input[name="recordWeight"]').value));
    const headCircumferences = records.map(record => parseFloat(record.querySelector('input[name="recordHeadCircumference"]').value));

    console.log(labels, heights, weights, headCircumferences);

    if (heightChart) heightChart.destroy();
    if (weightChart) weightChart.destroy();
    if (headCircumferenceChart) headCircumferenceChart.destroy();
    
    heightChart = createChart('heightChart', 'Boy (cm)', labels, heights, 'blue', birthDate, gender);
    weightChart = createChart('weightChart', 'Kilo (kg)', labels, weights, 'green', birthDate, gender);
    headCircumferenceChart = createChart('headCircumferenceChart', 'Kafa Çapı (cm)', labels, headCircumferences, 'red', birthDate, gender);
});

document.getElementById('downloadPdfBtn').addEventListener('click', function() {
    const babyName = document.getElementById('babyName').value;
    const birthDate = document.getElementById('birthDate').value;
    const gender = document.getElementById('gender').value;
    
    const heightChartDataUrl = heightChart.toBase64Image();
    const weightChartDataUrl = weightChart.toBase64Image();
    const headCircumferenceChartDataUrl = headCircumferenceChart.toBase64Image();
    
    const records = Array.from(document.querySelectorAll('#growthRecords > .record')).map(record => ({
        date: record.querySelector('input[name="recordDate"]').value,
        height: record.querySelector('input[name="recordHeight"]').value,
        weight: record.querySelector('input[name="recordWeight"]').value,
        headCircumference: record.querySelector('input[name="recordHeadCircumference"]').value
    }));

    const tableBody = [
        ['Tarih', 'Boy (cm)', 'Kilo (kg)', 'Kafa Çapı (cm)'],
        ...records.map(record => [record.date, record.height, record.weight, record.headCircumference])
    ];

    const docDefinition = {
        content: [
            { text: 'Bebek Gelişim Takibi', style: 'header' },
            { text: `Bebek İsmi: ${babyName}`, style: 'subheader' },
            { text: `Doğum Tarihi: ${birthDate}`, style: 'subheader' },
            { text: `Cinsiyet: ${gender === 'male' ? 'Erkek' : 'Kız'}`, style: 'subheader' },
            { text: 'Boy (cm)', style: 'chartTitle' },
            { image: heightChartDataUrl, width: 500 },
            { text: 'Kilo (kg)', style: 'chartTitle' },
            { image: weightChartDataUrl, width: 500 },
            { text: 'Kafa Çapı (cm)', style: 'chartTitle' },
            { image: headCircumferenceChartDataUrl, width: 500 },
            { text: 'Veri Tablosu', style: 'chartTitle' },
            {
                table: {
                    headerRows: 1,
                    body: tableBody
                }
            }
        ],
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                marginBottom: 10
            },
            subheader: {
                fontSize: 14,
                marginBottom: 5
            },
            chartTitle: {
                fontSize: 16,
                bold: true,
                marginTop: 10,
                marginBottom: 5
            }
        }
    };
    
    pdfMake.createPdf(docDefinition).download('Bebek_Gelisim_Takibi.pdf');
});

function createChart(chartId, label, labels, data, borderColor, birthDate, gender) {
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
                },
                {
                    label: 'Ortalama Kız',
                    data: getAverageData(labels, 'female', label, birthDate),
                    borderColor: 'pink',
                    borderDash: [5, 5],
                    fill: false
                },
                {
                    label: 'Ortalama Erkek',
                    data: getAverageData(labels, 'male', label, birthDate),
                    borderColor: 'blue',
                    borderDash: [5, 5],
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

function getAverageData(labels, gender, type, birthDate) {
    const averageData = {
        'female': {
            'Boy (cm)': [50, 52, 54, 56, 57, 59, 61, 62, 63, 64, 65, 66],
            'Kilo (kg)': [2950, 3500, 4000, 4500, 5000, 5400, 5800, 6150, 6500, 6750, 7000, 7200],
            'Kafa Çapı (cm)': [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46]
        },
        'male': {
            'Boy (cm)': [51, 53, 55, 57, 58, 60, 62, 63, 65, 66, 68, 70],
            'Kilo (kg)': [3000, 3600, 4150, 4600, 5100, 5500, 6000, 6300, 6700, 6950, 7200, 7450],
            'Kafa Çapı (cm)': [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47]
        }
    };
    
    return labels.map(label => {
        const recordDate = new Date(label);
        const monthDiff = (recordDate.getFullYear() - birthDate.getFullYear()) * 12 + (recordDate.getMonth() - birthDate.getMonth());
        return averageData[gender][type][monthDiff] || null;
    });
}