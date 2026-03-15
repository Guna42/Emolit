const fs = require('fs');
const path = 'C:/Users/GUNA/Videos/Emolit/frontend/src/pages/CalendarPage.tsx';
const content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// The new clean pages end with the return's closing ");" at line 794 (0-indexed: 793)
// We need to find that clean ending and then append the IIFE closing, style tag, component closing, and export

// Find line with "                );" that ends the IIFE return after page 3
let cutIndex = -1;
for (let i = 780; i < lines.length; i++) {
    const trimmed = lines[i].replace(/\r/g, '').trim();
    if (trimmed === '});' || trimmed === '});') {
        // This might be the end of return
    }
    // Look for the pattern: "                );" which is the return closing
    if (lines[i].replace(/\r/g, '') === '                );') {
        cutIndex = i;
        break;
    }
}

console.log('Found return closing at 0-indexed line:', cutIndex);

if (cutIndex > 0) {
    // Take lines 0 through cutIndex (the return statement closing)
    const cleanLines = lines.slice(0, cutIndex + 1);

    // Append the proper closing code
    const tail = `
            })()}

            <style dangerouslySetInnerHTML={{
                __html: \`
                @media screen { .print-engine-root { display: none !important; } }
                @media print {
                    .no-print { display: none !important; }
                    @page { size: A4 portrait; margin: 0mm; }
                    html, body, #root {
                        height: auto !important; overflow: visible !important;
                        margin: 0 !important; padding: 0 !important;
                        display: block !important; position: static !important;
                        background: white !important;
                    }
                    .print-engine-root {
                        display: block !important; height: auto !important;
                        overflow: visible !important; position: static !important;
                        background-color: white !important;
                    }
                    .print-page {
                        display: flex !important;
                        page-break-after: always !important;
                        break-after: page !important;
                        box-sizing: border-box !important;
                    }
                    .first-page { page-break-after: always !important; break-after: page !important; }
                    .clinical-section { page-break-before: always !important; break-before: page !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
                .animate-reveal { animation: reveal 1s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes reveal {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            \` }} />
        </div>
    );
};

export default CalendarPage;
`;

    const finalContent = cleanLines.join('\n') + tail;
    fs.writeFileSync(path, finalContent, 'utf8');

    const newLines = finalContent.split('\n').length;
    console.log('File written successfully with', newLines, 'lines.');
} else {
    console.log('Could not find return closing line!');

    // Debug: show lines around 790-800
    for (let i = 790; i < Math.min(800, lines.length); i++) {
        console.log(i + ':', JSON.stringify(lines[i]));
    }
}
