#!/usr/bin/env python

"""This is a plugin for wpull that intelligently adjusts domains when mirroring a ghost site for static serving
It is intended for use with the --plugin-script option for wpull, not to be run as a main program
Note that the SOURCE_DOMAIN and PRODUCTION_DOMAIN values must be passed to wpull as environment variables"""

import re
from wpull.application.hook import Actions
from wpull.application.plugin import WpullPlugin, PluginFunctions, hook, event
from wpull.protocol.abstract.request import BaseResponse
from wpull.pipeline.session import ItemSession
import wpull
import logging
import os

class GhostDomainsPlugin(WpullPlugin):
    logger = logging.getLogger('wpull.plugin.ghost_domains') # this has to start with wpull or the logging will be filtered
    SOURCE_DOMAIN = os.environ.get('SOURCE_DOMAIN')
    PRODUCTION_DOMAIN = os.environ.get('PRODUCTION_DOMAIN')

    def activate(self):
        super().activate()
        if not self.SOURCE_DOMAIN:
            self.logger.warn(f"Did not find SOURCE_DOMAIN in environment; will not remap ghost production urls")
        if not self.PRODUCTION_DOMAIN:
            self.logger.warn(f"Did not find PRODUCTION_DOMAIN in environment; will not remap ghost production urls")
        if self.SOURCE_DOMAIN and self.PRODUCTION_DOMAIN:
            self.logger.info(f"Will remap {self.PRODUCTION_DOMAIN} to {self.SOURCE_DOMAIN}")

    def deactivate(self):
        super().deactivate()

    @hook(PluginFunctions.accept_url)
    def my_accept_func(self, item_session: ItemSession, verdict: bool, reasons: dict) -> bool:
        if not self.PRODUCTION_DOMAIN or not self.SOURCE_DOMAIN:
            # this means that this is not properly set up in order to be able to filter domains
            return True
        if item_session.request.url.startswith(self.PRODUCTION_DOMAIN):
            adjusted_url = item_session.request.url.replace(self.PRODUCTION_DOMAIN, self.SOURCE_DOMAIN, 1)
            item_session.add_child_url(adjusted_url)
            self.logger.info(f'Production domain remap: rather than retrieving {item_session.request.url}, will retrieve {adjusted_url}')
            return False
        elif item_session.request.url.startswith(self.SOURCE_DOMAIN):
            if item_session.request.url.startswith(self.SOURCE_DOMAIN.rstrip('/') + '/ghost/'):
                self.logger.info(f'Not retrieving ghost admin interface url: {item_session.request.url}')
                return False
            return True
        return False

    # to enable these stubs, uncomment the @event decorator

    # @event(PluginFunctions.get_urls)
    def my_get_urls(self, item_session: ItemSession):
        self.logger.debug(f'get_urls: {item_session.request.url}')

    # @event(PluginFunctions.queued_url)
    def my_queued_url(self, url_info: wpull.url.URLInfo):
        self.logger.debug(f'queued_url: {url_info.url}')

    # @event(PluginFunctions.dequeued_url)
    def my_dequeued_url(self, url_info: wpull.url.URLInfo, record_info: wpull.pipeline.item.URLRecord):
        self.logger.debug(f'dequeued_url: {url_info.url} -> {record_info.url}')


if __name__ == '__main__':
    print(__doc__)

