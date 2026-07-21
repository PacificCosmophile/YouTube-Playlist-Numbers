// ==UserScript==
// @name         YouTube Playlist Numbers
// @namespace    https://github.com/
// @version      1.0.0
// @description  Displays playlist video numbers on YouTube without changing the page layout.
// @author       PacificCosmophile+VibeCoded
// @match        https://www.youtube.com/playlist?*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(() => {
    'use strict';

    const STYLE_ID = 'yt-playlist-number-style';

    function injectStyle() {
        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement('style');
        style.id = STYLE_ID;

        style.textContent = `
.ytpn-index{
    position:absolute;
    top:6px;
    left:6px;

    min-width:16px;
    height:16px;

    padding:1px 4px;

    box-sizing:border-box;

    display:flex;
    align-items:center;
    justify-content:center;

    background:rgba(0,0,0,.80);

    color:#fff;

    border-radius:3px;

    font-family:Roboto,Arial,sans-serif;
    font-size:11px;
    font-weight:500;
    line-height:1;

    user-select:none;
    pointer-events:none;

    z-index:2;

    opacity:.90;
    transition:opacity .15s ease;
}

.ytLockupViewModelContentImage:hover .ytpn-index{
    opacity:1;
}
`;
        document.head.appendChild(style);
    }

    function processItem(item) {

        if (item.dataset.ytpnProcessed)
            return;

        const thumb = item.querySelector('.ytLockupViewModelContentImage');

        if (!thumb)
            return;

        const href = thumb.getAttribute('href');

        if (!href)
            return;

        const match = href.match(/[?&]index=(\d+)/);

        if (!match)
            return;

        // Ensure positioning context
        if (getComputedStyle(thumb).position === 'static') {
            thumb.style.position = 'relative';
        }

        const badge = document.createElement('span');
        badge.className = 'ytpn-index';
        badge.textContent = match[1];

        thumb.appendChild(badge);

        item.dataset.ytpnProcessed = '1';
    }

    function scan() {

        document
            .querySelectorAll('yt-lockup-view-model')
            .forEach(processItem);

    }

    function observePlaylist() {

        const container = document.querySelector('#contents');

        if (!container)
            return false;

        scan();

        const observer = new MutationObserver(mutations => {

            for (const mutation of mutations) {

                for (const node of mutation.addedNodes) {

                    if (node.nodeType !== 1)
                        continue;

                    if (node.matches?.('yt-lockup-view-model')) {
                        processItem(node);
                        continue;
                    }

                    node.querySelectorAll?.('yt-lockup-view-model')
                        .forEach(processItem);
                }
            }

        });

        observer.observe(container, {
            childList: true,
            subtree: true
        });

        return true;
    }

    function init() {

        injectStyle();

        if (observePlaylist())
            return;

        const retry = new MutationObserver(() => {

            if (observePlaylist()) {
                retry.disconnect();
            }

        });

        retry.observe(document.body, {
            childList: true,
            subtree: true
        });

    }

    document.addEventListener('yt-navigate-finish', init);

    init();

})();
