// ==UserScript==
// @name         YouTube Playlist Numbers
// @namespace    https://github.com/PacificCosmophile
// @description  Displays playlist video numbers on YouTube's new playlist page.
// @version      1.2
// @author       PacificCosmophile+Vibecoded
// @license      MIT
// @match        https://www.youtube.com/playlist?*
// @homepageURL  https://github.com/PacificCosmophile/YouTube-Playlist-Numbers
// @icon         https://raw.githubusercontent.com/PacificCosmophile/YouTube-Playlist-Numbers/main/icon.png
// @downloadURL  https://update.greasyfork.org/scripts/588001/YouTube%20Playlist%20Numbers.user.js
// @updateURL    https://update.greasyfork.org/scripts/588001/YouTube%20Playlist%20Numbers.meta.js
// @run-at       document-idle
// @grant        none
// ==/UserScript==

// Icon credit:
// Youtube playlist icons created by kawalanicon
// https://www.flaticon.com/free-icons/youtube-playlist

(() => {
    'use strict';

    const STYLE_ID = 'ytpn-style';
    let playlistObserver = null;
    let retryObserver = null;

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

        const href = thumb.href || thumb.getAttribute('href');

        if (!href)
            return;

        const match = href.match(/[?&]index=(\d+)/);

        if (!match)
            return;

        // Ensure positioning context
        if (!thumb.style.position) {
            thumb.style.position = 'relative';
        }

        const badge = document.createElement('span');
        badge.className = 'ytpn-index';
        badge.textContent = match[1];

        thumb.appendChild(badge);

        item.dataset.ytpnProcessed = '1';
    }

    function scan(container) {

        container
            .querySelectorAll('yt-lockup-view-model')
            .forEach(processItem);

    }

    function observePlaylist() {

        const container = document.querySelector('#contents');

        if (!container)
            return false;

        scan(container);

        if (playlistObserver) {
            playlistObserver.disconnect();
        }

        playlistObserver = new MutationObserver(mutations => {

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

        playlistObserver.observe(container, {
            childList: true,
            subtree: true
        });

        return true;
    }

    function init() {

        injectStyle();

        if (playlistObserver) {
            playlistObserver.disconnect();
            playlistObserver = null;
        }

        if (retryObserver) {
            retryObserver.disconnect();
            retryObserver = null;
        }

        if (observePlaylist())
            return;

        retryObserver = new MutationObserver(() => {

            if (observePlaylist()) {
                retryObserver.disconnect();
                retryObserver = null;
            }

        });

        retryObserver.observe(document.body, {
            childList: true,
            subtree: true
        });

    }

    document.addEventListener('yt-navigate-finish', init);

    init();

})();
