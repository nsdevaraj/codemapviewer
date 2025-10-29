document.getElementById('fileInput').addEventListener('change', handleFileSelect);

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            try {
                const data = JSON.parse(content);
                buildTreeView(data);
            } catch (error) {
                alert('Error parsing JSON file: ' + error.message);
            }
        };
        reader.readAsText(file);
    }
}

function buildTreeView(data) {
    const treeView = document.getElementById('treeView');
    treeView.innerHTML = '';

    const ul = document.createElement('ul');

    // Root node
    const rootLi = document.createElement('li');
    const rootSpan = document.createElement('span');
    rootSpan.className = 'caret';
    rootSpan.textContent = data.title;
    rootSpan.addEventListener('click', function() {
        this.parentElement.querySelector('.nested').classList.toggle('active');
        this.classList.toggle('caret-down');
    });
    rootLi.appendChild(rootSpan);

    const nestedUl = document.createElement('ul');
    nestedUl.className = 'nested';

    data.traces.forEach(trace => {
        const traceLi = document.createElement('li');
        const traceSpan = document.createElement('span');
        traceSpan.className = 'caret';
        traceSpan.textContent = trace.title;
        traceSpan.addEventListener('click', function() {
            this.parentElement.querySelector('.nested').classList.toggle('active');
            this.classList.toggle('caret-down');
        });
        traceLi.appendChild(traceSpan);

        traceLi.addEventListener('click', (event) => {
            event.stopPropagation();
            displayTraceDetails(trace);
        });

        const locationsUl = document.createElement('ul');
        locationsUl.className = 'nested';

        trace.locations.forEach(location => {
            const locationLi = document.createElement('li');
            locationLi.textContent = location.title;
            locationLi.addEventListener('click', (event) => {
                event.stopPropagation();
                displayLocationDetails(location, trace.traceGuide);
            });
            locationsUl.appendChild(locationLi);
        });
        traceLi.appendChild(locationsUl);
        nestedUl.appendChild(traceLi);
    });

    rootLi.appendChild(nestedUl);
    ul.appendChild(rootLi);
    treeView.appendChild(ul);
}

function displayTraceDetails(trace) {
    const detailView = document.getElementById('detailView');
    let content = `<h2>${trace.title}</h2>`;
    content += `<p>${trace.description}</p>`;
    if (trace.traceTextDiagram) {
        content += `<h3>Trace Diagram</h3><pre>${trace.traceTextDiagram}</pre>`;
    }
    if (trace.traceGuide) {
        content += `<h3>Trace Guide</h3><div>${formatTraceGuide(trace.traceGuide)}</div>`;
    }
    detailView.innerHTML = content;
}

function displayLocationDetails(location, traceGuide) {
    const detailView = document.getElementById('detailView');
    let content = `<h2>${location.title}</h2>`;
    content += `<p><strong>Path:</strong> ${location.path}</p>`;
    content += `<p><strong>Line:</strong> ${location.lineNumber}</p>`;
    content += `<p><strong>Code:</strong> <code>${location.lineContent}</code></p>`;
    content += `<p>${location.description}</p>`;
    if (traceGuide) {
        content += `<h3>Trace Guide</h3><div>${formatTraceGuide(traceGuide)}</div>`;
    }
    detailView.innerHTML = content;
}

function formatTraceGuide(traceGuide) {
    let html = traceGuide.replace(/\\n/g, '<br>');
    html = html.replace(/(\*\*|##)(.*?)\1/g, '<strong>$2</strong>');
    return html;
}
