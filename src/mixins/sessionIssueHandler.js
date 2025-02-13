/**
 * @copyright Copyright (c) 2019 Marco Ambrosini <marcoambrosini@pm.me>
 *
 * @author Marco Ambrosini <marcoambrosini@pm.me>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

import { generateUrl } from '@nextcloud/router'
import { EventBus } from '../services/EventBus'
import SessionStorage from '../services/SessionStorage'

const sessionIssueHandler = {
	data() {
		return {
			isLeavingAfterSessionIssue: false,
		}
	},

	beforeDestroy() {
		EventBus.$off('duplicateSessionDetected', this.duplicateSessionTriggered)
		EventBus.$off('deletedSessionDetected', this.deletedSessionTriggered)
	},

	beforeMount() {
		EventBus.$on('duplicateSessionDetected', this.duplicateSessionTriggered)
		EventBus.$on('deletedSessionDetected', this.deletedSessionTriggered)
	},

	methods: {
		duplicateSessionTriggered() {
			this.isLeavingAfterSessionIssue = true
			SessionStorage.removeItem('joined_conversation')
			// Need to delay until next tick, otherwise the PreventUnload is still being triggered
			// Putting the window in front with the warning and irritating the user
			this.$nextTick(() => {
				// FIXME: can't use router push as it somehow doesn't clean up
				// fully and leads the other instance where "Join here" was clicked
				// to redirect to "not found"
				window.location = generateUrl('/apps/spreed/duplicate-session')
			})
		},

		deletedSessionTriggered() {
			this.$router.push({ name: 'notfound', params: { skipLeaveWarning: true } })
			this.$store.dispatch('updateToken', '')
		},
	},
}

export default sessionIssueHandler
