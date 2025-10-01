import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js"





@customElement("admin-actions")
export class AdminActions extends LitElement {
    @property() token?: string

    @state() agentList = []
    static styles = [
        css`
                        :host{
            display: flex;
            flex-direction: column;
            border: solid 3px var(--md-primary-text-color);
            padding: 2em;
            color:var(--md-primary-text-color)
            }
            .title{
            text-align: center
            }
            table{
            display:table;
            border-collapse:collapse;
            border-spacing: 0;
            margin-top: 15px;
            }
            tr, th, td{
            border: solid 1px;
            text-align: center;
            }
            .hidden{
            display:none;
            }
        `
    ];
    async getAgents() {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Accept", "application/json");
        myHeaders.append("Authorization", `Bearer ${this.token}`);

        const raw = JSON.stringify({
            "query": "query refactored861($from:Long! $to:Long! $filter:AgentSessionFilters $extFilter:AgentSessionSpecificFilters $pagination:Pagination){agentSession(from:$from to:$to filter:$filter extFilter:$extFilter pagination:$pagination){agentSessions{isActive agentId agentName agentSessionId agentSignOutReason userLoginId endTime startTime state siteId siteName teamId teamName orgId orgName multiMediaProfileType skillsProfile agentSkills parentOrgId parentOrgName channelInfo{currentState lastActivityTime}}pageInfo{endCursor hasNextPage}intervalInfo{interval timezone}}}",
            "variables": {
                "from": `${Date.now() - 86400000}`,
                "to": `${Date.now()}`,
                "filter": {
                    "and": [
                        {
                            "isActive": {
                                "equals": true
                            }
                        },
                        {
                            "channelInfo": {
                                "channelType": {
                                    "equals": "telephony"
                                }
                            }
                        }
                    ]
                },
                "extFilter": {},
                "pagination": {}
            }
        });

        const requestOptions: object = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        try {
            const response = await fetch("https://api.wxcc-us1.cisco.com/search", requestOptions);
            const result = await response.json();
            this.agentList = result.data.agentSession.agentSessions;
            console.log(result)
        } catch (error) {
            console.error(error);
        };
    }

async logOutAgent(e: any){
    const myHeaders = new Headers();
myHeaders.append("Authorization", "Bearer NjM2YjBjNTktZTExMC00YjNlLWFmZGMtNGYyOWFkMGY4YTYzZGQ0YWFmZGQtZjdj_P0A1_e56f00d4-98d8-4b62-a165-d05a41243d98");
myHeaders.append("Content-Type", "application/json");

const raw = JSON.stringify({
  "logoutReason": "test",
  "agentId": e.target.value
});

const requestOptions:object = {
  method: "PUT",
  headers: myHeaders,
  body: raw,
  redirect: "follow"
};

try {
  const response = await fetch("https://api.wxcc-us1.cisco.com/v1/agents/logout", requestOptions);
  const result = await response.text();
  console.log(result)
} catch (error) {
  console.error(error);
};
}

    
    render() {
        return html`
        
        <h1 class="title">Admin Actions</h1>
        <div>
            <button @click=${this.getAgents}>Refresh Agent List</button>
        </div>
            <table>
                <thead>
                    <th>Agent Name</th>
                    <th>Team</th>
                    <th>Log in Time</th>
                    <th>Status</th>
                    <th>Time in Status</th>
                     <th>Action</th>
                </thead>
                    ${this.agentList?.map((t: any) => html`
                 <tbody>
                       <td>${t.agentName}</td>
                        <td>${t.teamName}</td>
                        <td>${new Date(t.startTime).toLocaleString()}</td>
                        <td>${t.channelInfo[0].currentState}</td>
                        <td>${new Date(Date.now() - t.channelInfo[0].lastActivityTime).toISOString().slice(11, -5)}</td>
                        <td><button value=${t.agentId} @click="${this.logOutAgent}">Log Out</button></td>
                </tbody>
                `)}
            </table>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "admin-actions": AdminActions;
    }
}
