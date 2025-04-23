#!/usr/bin/env python

"""This is a plugin for wpull that intelligently adjusts domains when mirroring a ghost site for static serving
It is intended for use with the --plugin-script option for wpull, not to be run as a main program"""

import re
from wpull.application.hook import Actions
from wpull.application.plugin import WpullPlugin, PluginFunctions, hook, event
from wpull.protocol.abstract.request import BaseResponse
from wpull.pipeline.session import ItemSession
import wpull

# FIXME: pass these as options:
SOURCE_BASE = 'http://localhost:2368/'
PRODUCTION_BASE = 'https://ghost.example.com/'

class GhostDomainsPlugin(WpullPlugin):
    def activate(self):
        super().activate()
        import pprint, os, sys
        pprint.pprint(os.environ)
        pprint.pprint(sys.argv)

    def deactivate(self):
        super().deactivate()

    @hook(PluginFunctions.accept_url)
    def my_accept_func(self, item_session: ItemSession, verdict: bool, reasons: dict) -> bool:
        if item_session.request.url.startswith(PRODUCTION_BASE):
            adjusted_url = item_session.request.url.replace(PRODUCTION_BASE, SOURCE_BASE, 1)
            item_session.add_child_url(adjusted_url)
            print(f'accept check: {item_session.request.url} -> {adjusted_url}')
            return False
        elif item_session.request.url.startswith(SOURCE_BASE):
            return True
        return False

    @event(PluginFunctions.get_urls)
    def my_get_urls(self, item_session: ItemSession):
        print(f'get_urls: {item_session.request.url}')

    @event(PluginFunctions.queued_url)
    def my_queued_url(self, url_info: wpull.url.URLInfo):
        print(f'queued_url: {url_info.url}')

    @event(PluginFunctions.dequeued_url)
    def my_dequeued_url(self, url_info: wpull.url.URLInfo, record_info: wpull.pipeline.item.URLRecord):
        print(f'dequeued_url: {url_info.url} -> {record_info.url}')


if __name__ == '__main__':
    print(__doc__)

