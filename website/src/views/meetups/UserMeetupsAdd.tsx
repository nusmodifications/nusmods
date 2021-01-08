import React, { Component } from 'react'
import classnames from 'classnames';

import { 
    deserializeTimetable, 
    mapUserObject,
    generateColor, 
    User } from './meetups'
import styles from './UserMeetupsAdd.scss'


type Props = {
    addUser: (userObject : User) => void,
    userNum: number
}

type State = {
    userName: string,
    userLink: string
}

export class UserMeetupsAddComponent extends Component<Props, State> {
    state = {
        userName: '',
        userLink: ''
    }

    validateUserInput = (name: string, link: string) => {
        // check non empty
        return ((name && link) 
            && name.toLowerCase() !== 'myself' 
            && link.includes('MEETUPS')
            && link.split('=').length > 1)
    }

    onSubmit = (event : React.FormEvent) => {
        const { addUser, userNum } = this.props
        event.preventDefault(); 
        // deserialize and convert state
        if (this.validateUserInput(this.state.userName, this.state.userLink)) {
            addUser(mapUserObject(
                generateColor(userNum), 
                this.state.userName, 
                deserializeTimetable(this.state.userLink)))
            this.setState({
                userName: '',
                userLink: ''
            })
        } 
    }

    onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
        if (event.key === 'Enter') {
          event.preventDefault();
          event.stopPropagation();
          this.onSubmit(event);
        }
      }

    render() {
        const renderInput = (
                <form
                    onSubmit={e => this.onSubmit(e)}>
                    <div className={classnames(styles.container)}>
                        <input
                            className={classnames(styles.inputLeft)}
                            value={this.state.userName}
                            placeholder={'Friend\'s Name'}
                            onKeyDown={this.onKeyDown}
                            onChange={e => this.setState({userName: e.target.value})}
                        />
                        <input 
                            className={classnames(styles.inputRight)}
                            value={this.state.userLink}
                            placeholder={'Friend\'s Availability Link'} 
                            onKeyDown={this.onKeyDown}
                            onChange={e => this.setState({userLink: e.target.value})}
                        />
                    </div>
                </form>
            )
        return renderInput
    }
}

export default UserMeetupsAddComponent