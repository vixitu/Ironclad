$('.categories li')[0].classList.add('active')

$('.categories li').on('click', setCategory)

function setCategory(){
    $('.categories li').removeClass('active')
    const selected = $(this)
    selected.addClass('active')

    $(`.commands li`).hide()

    const categoryCommands = $(`.commands .${selected[0].id}`) 
    categoryCommands.show()

    
    $('#commandError').text(categoryCommands.length <= 0 ? 'This section is still under development.' : '')
    
}

setCategory.bind($('.categories li')[0])()