/**
 * @file main.js
 * @author huanghuiquan
 */

define(function (require) {
    'use strict';
    let axios = require('axios');
    let render = require('./render');

    // 异步请求数据，并在前端渲染
    axios.get('/api/movies').then(function (response) {
        let $movieList = document.querySelector('.movie-list');

        if (response.status !== 200) {
            $movieList.innerHTML = '网络错误';
            return;
        }
        $movieList.innerHTML = render(response.data);
    });
    // window.addEventListener('load', function(event) {
    //     if('serviceWorker' in window.navigator) {
    //         navigator.serviceWorker.register('sw.js',{scope:'/'}).then(function(registeration){
    //             console.log('service worker register success with scope', registeration.socpe)
    //         })
    //     }
    // })
    
});
