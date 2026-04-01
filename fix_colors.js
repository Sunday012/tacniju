const fs = require('fs');
const path = require('path');

const directories = [
    'components/management',
    'components/vouchers',
    'components/inventory',
    'components/attendance',
    'app/reports/day-book',
    'app/reports/trial-balance',
    'app/reports/profit-loss',
    'app/reports/balance-sheet',
];

const replacements = [
    [/bg-slate-900\/80/g, 'bg-white shadow-sm'],
    [/bg-slate-900\/40/g, 'bg-slate-100'],
    [/bg-slate-950\/50/g, 'bg-slate-50'],
    [/bg-slate-900/g, 'bg-white'],
    [/bg-slate-950/g, 'bg-slate-50'],
    [/border-slate-800/g, 'border-slate-200'],
    [/border-slate-700/g, 'border-slate-300'],
    [/text-slate-100/g, 'text-slate-900'],
    [/text-slate-200/g, 'text-slate-800'],
    [/text-slate-300/g, 'text-slate-700'],
    [/text-slate-400/g, 'text-slate-500'],
    [/dark:bg-slate-950/g, ''],
    [/dark:text-slate-100/g, ''],
    [/dark:text-slate-400/g, ''],
    [/border-t-2 border-slate-700/g, 'border-t-2 border-slate-300'],
    [/bg-emerald-950\/50/g, 'bg-emerald-100'],
    [/bg-red-950\/50/g, 'bg-red-100'],
    [/bg-blue-950\/50/g, 'bg-blue-100'],
    [/bg-amber-950\/50/g, 'bg-amber-100'],
];

function processDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let newContent = content;
            for (const [regex, replacement] of replacements) {
                newContent = newContent.replace(regex, replacement);
            }
            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent, 'utf8');
                console.log('Fixed', fullPath);
            }
        }
    }
}

directories.forEach(processDir);
