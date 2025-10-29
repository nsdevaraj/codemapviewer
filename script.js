document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const treeView = document.getElementById('treeView');
    const detailView = document.getElementById('detailView');
    let jsonData = null;

    fileInput.addEventListener('change', handleFileSelect, false);

    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                jsonData = JSON.parse(e.target.result);
                displayTreeView(jsonData);
                displayInitialDetail(jsonData);
            } catch (error) {
                alert('Error parsing JSON file: ' + error.message);
            }
        };
        reader.readAsText(file);
    }

    function displayTreeView(data) {
        treeView.innerHTML = '';
        const ul = document.createElement('ul');

        const mainNode = createClickableNode(data.title, () => displayInitialDetail(data));
        ul.appendChild(mainNode);

        if (data.traces && data.traces.length > 0) {
            const tracesUl = document.createElement('ul');
            tracesUl.classList.add('nested');
            mainNode.appendChild(tracesUl);

            const caret = document.createElement('span');
            caret.classList.add('caret');
            mainNode.insertBefore(caret, mainNode.firstChild);

            caret.addEventListener('click', (e) => {
                e.stopPropagation();
                tracesUl.classList.toggle('active');
                caret.classList.toggle('caret-down');
            });

            data.traces.forEach(trace => {
                const traceNode = createClickableNode(trace.title, () => displayTraceDetails(trace));
                tracesUl.appendChild(traceNode);

                if (trace.locations && trace.locations.length > 0) {
                    const locationsUl = document.createElement('ul');
                    locationsUl.classList.add('nested');
                    traceNode.appendChild(locationsUl);

                    const traceCaret = document.createElement('span');
                    traceCaret.classList.add('caret');
                    traceNode.insertBefore(traceCaret, traceNode.firstChild);

                    traceCaret.addEventListener('click', (e) => {
                        e.stopPropagation();
                        locationsUl.classList.toggle('active');
                        traceCaret.classList.toggle('caret-down');
                    });

                    trace.locations.forEach(location => {
                        const locationNode = createClickableNode(location.title, () => displayLocationDetails(location));
                        locationsUl.appendChild(locationNode);
                    });
                }
            });
        }
        treeView.appendChild(ul);
    }

    function createClickableNode(text, onClick) {
        const li = document.createElement('li');
        li.textContent = text;
        li.addEventListener('click', (e) => {
            e.stopPropagation();
            onClick();
        });
        return li;
    }

    function displayInitialDetail(data) {
        detailView.innerHTML = `
            <h1>${data.title}</h1>
            <p>${data.description || ''}</p>
            <hr>
            <h2>Metadata</h2>
            <pre>${JSON.stringify(data.metadata, null, 2)}</pre>
        `;
    }

    function displayTraceDetails(trace) {
        detailView.innerHTML = `
            <h2>${trace.title}</h2>
            <p>${trace.description}</p>
            <h3>Trace Guide</h3>
            <div>${formatTraceGuide(trace.traceGuide)}</div>
            <h3>Trace Diagram</h3>
            <pre>${trace.traceTextDiagram}</pre>
        `;
    }

    function displayLocationDetails(location) {
        detailView.innerHTML = `
            <h3>${location.title}</h3>
            <p><strong>Path:</strong> ${location.path}</p>
            <p><strong>Line:</strong> ${location.lineNumber}</p>
            <p><strong>Description:</strong> ${location.description}</p>
            <pre><code>${location.lineContent}</code></pre>
        `;
    }

    function formatTraceGuide(guide) {
        if (!guide) return '';
        // Simple formatting for markdown-like text
        return guide
            .split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('')
            .replace(/##\s(.+)/g, '<h3>$1</h3>')
            .replace(/#\s(.+)/g, '<h2>$1</h2>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\[(.+?)\]/g, '<code>$1</code>');
    }
});
