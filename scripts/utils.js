function getRandomColor() {
    var color = 'rgba(';

    for (var i = 0; i < 3; i++)
        color += Math.floor(Math.random() * 255) + ',';

    color += '0.8)';

    return color;

}