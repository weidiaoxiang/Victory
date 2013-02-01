

from handlers.base_handler import BaseHandler
from services.account_service import AccountService
from services.application_service import *
import copy
import logging


class RedirectToApplicationHandler(BaseHandler):
    def get(self):
        self.redirect('/settings/applications')


# get profile page, update profile
class ProfileHandler(BaseHandler):
    def get(self):
        self.view_model['title'] = 'Profile - '
        return self.render_template('settings_profile.html', **self.view_model)

    # update profile
    def put(self):
        rq = copy.copy(self.request)
        rq.method = 'POST'
        name = rq.get('name')

        acs = AccountService(self.context)
        success, name = acs.update_profile(name)

        return self.json({ 'success': success, 'name': name })


# get change password page, update password
class PasswordHandler(BaseHandler):
    def get(self):
        self.view_model['title'] = 'Change Password - '
        return self.render_template('settings_password.html', **self.view_model)

    # update password
    def put(self):
        rq = copy.copy(self.request)
        rq.method = 'POST'
        old_password = rq.get('old_password')
        new_password = rq.get('new_password')
        confirm_password = rq.get('confirm_password')

        if new_password == confirm_password:
            acs = AccountService(self.context)
            success = acs.update_password(old_password, new_password)
        else:
            success = False

        self.json({ 'success': success })


class SessionsHandler(BaseHandler):
    def get(self):
        self.view_model['title'] = 'Sessions - '
        acs = AccountService(self.context)
        self.view_model['result'] = acs.get_sessions()
        return self.render_template('settings_sessions.html', **self.view_model)

    def delete(self, session_id):
        acs = AccountService(self.context)
        self.json({ 'success': acs.logout(session_id) })


# applications handler
class ApplicationsHandler(BaseHandler):
    # list applications
    def get(self):
        self.view_model['title'] = 'Applications - '

        aps = ApplicationService(self.context)
        self.view_model['result'] = aps.get_applications(True)

        return self.render_template('settings_application.html', **self.view_model)

    def post(self):
    # add a new application
        name = self.request.get('name')
        description = self.request.get('description')

        aps = ApplicationService(self.context)
        self.json({ 'success': aps.add_application(name, description) })

    # update a application
    def put(self, application_id):
        try: application_id = long(application_id)
        except:
            self.json({ 'success': False })
            return

        # webapp2.Request.get() is just for POST arguments
        rq = copy.copy(self.request)
        rq.method = 'POST'
        name = rq.get('name')
        description = rq.get('description')

        aps = ApplicationService(self.context)
        self.json({ 'success': aps.update_application(application_id, name, description) })

    # delete a application
    def delete(self, application_id):
        try: application_id = long(application_id)
        except:
            self.json({ 'success': False })
            return

        aps = ApplicationService(self.context)
        self.json({ 'success': aps.delete_application(application_id) })


# the application invite handler
class ApplicationInviteHandler(BaseHandler):
    # invite user to join application
    def post(self, application_id):
        email = self.request.get('email')
        try: application_id = long(application_id)
        except:
            self.json({ 'success': False })
            return

        acs = AccountService(self.context)
        aps = ApplicationService(self.context)

        # invite user
        user = acs.invite_user(email)
        if user is None:
            self.json({ 'success': False })
            return

        # add the new user to the application
        success = aps.add_user_to_application(user.key().id(), application_id)

        self.json({ 'success': success })


# the member of an application handler
class ApplicationMemberHandler(BaseHandler):
    # remove the viewer in the application
    def delete(self, application_id, member_id):
        try: application_id = long(application_id)
        except:
            self.json({ 'success': False })
            return
        try: member_id = long(member_id)
        except:
            self.json({ 'success': False })
            return

        aps = ApplicationService(self.context)
        success = aps.delete_user_from_application(member_id, application_id)

        self.json({ 'success': success })
