export const getLanguageFromFileName = (fileName) => {
    if (!fileName) return 'plaintext';
    const ext = fileName.split('.').pop().toLowerCase();

    const languageMap = {
        js: 'javascript', jsx: 'javascript',
        ts: 'typescript', tsx: 'typescript',
        py: 'python',
        html: 'html', css: 'css',
        json: 'json',
        c: 'c', cpp: 'cpp',
        java: 'java',
        md: 'markdown',
        sql: 'sql',
        sh: 'shell', bash: 'shell'
    };

    return languageMap[ext] || 'plaintext';
};