module.exports = {
    formate: 'A4',
    orientation: 'portrait',
    border: '8mm',
    header: {
        height: '15mm',
        contents: '<h4 class="text-warning" style="font-size: 20; font-weight:800; text-align: center; "> E - VOTING </h4>'
    },
    footer: {
        height: '20mm',
        first: 'Cover page',
        2: 'Second Page',
        default: '<span style="color: #444">{{page}}</span><span>{{page}}</span>',
        last: 'Last Page'
    }
}