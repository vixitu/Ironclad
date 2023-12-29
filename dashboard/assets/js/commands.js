$('.categories li')[0].classList.add('active')

$('.categories li').on('click', setCategory)

function setCategory(){
    blank()
    const selected = $(this)
    selected.addClass('active')

    const categoryCommands = $(`.commands .${selected[0].id}`) 
    categoryCommands.show()

    
    $('#commandError').text(categoryCommands.length <= 0 ? 'This section is still under development.' : '')
    
}

function blank(){
    $('.categories li').removeClass('active')
    $(`.commands li`).hide()
}

setCategory.bind($('.categories li')[0])()

$('#search + button').on('click', () => {
    const query = $('#search input').val()
    if (!query.trim()){
        updateResultsText(commands)
        return $('.commands li').show()
    }
    const results = new Fuse(commands, {
        isCaseSensitive: false,
        treshold: 0.6,
        keys: [
            { name: 'name', weight: 1},
            { name: 'category', weight: 0.5}
        ]
    })
    .search(query)
    .map(r => r.item)

 $('.categories li').removeClass('active')
 $(`.commands li`).hide()
 
 for (const command of results){
    console.log(command.name)
    $(`#${command.name}Command`).show()
 }

 updateResultsText(results)
})

function updateResultsText(arr){
    $('#commandError').text(
        (arr.length <= 0)
        ? 'There is nothing to see here'
        : '')
}