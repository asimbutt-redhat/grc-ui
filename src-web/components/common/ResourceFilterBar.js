/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
'use strict'

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import resources from '../../../lib/shared/resources'
import { updateActiveFilters } from '../../actions/common'
import { Icon, Tag } from 'carbon-components-react'
import msgs from '../../../nls/platform.properties'
import _ from 'lodash'
import queryString from 'query-string'

resources(() => {
  require('../../../scss/resource-filterbar.scss')
})

class ResourceFilterBar extends React.Component {

  render() {
    const { locale } = this.context
    const { activeFilters={} } = this.props
    const boundFilters=[]
    const clearFilters = []
    // individual filter tags
    Object.keys(activeFilters).forEach(key=>{
      const activeSet = activeFilters[key]
      if (activeSet.size>0) {
        clearFilters.push(key)
        activeSet.forEach(value=>{
          let name = value
          if (name.length>26) {
            name=name.substr(0,12)+'..'+name.substr(-12)
          }
          boundFilters.push({
            name,
            onClick: this.removeActiveFilter.bind(this, key, value)
          })
        })
      }
    })
    // clear all tag
    if (clearFilters.length>0) {
      const clearAll = msgs.get('filter.remove.all', locale)
      return (
        <div className='resource-filter-bar'>
          <span className='title'>{msgs.get('filter.remove.filters', locale)}</span>
          {boundFilters.map(({name, onClick}) => {
            return <Tag key={name} type='custom'>
              {name}
              <Icon
                className='closeIcon'
                description={msgs.get('filter.remove.tag', locale)}
                name="icon--close"
                onClick={onClick}
              />
            </Tag>
          })}
          <span className='button' tabIndex='0' role={'button'}
            title={clearAll} aria-label={clearAll}
            onClick={this.handleClearClick.bind(this, clearFilters)}
            onKeyPress={this.handleClearKeyPress.bind(this, clearFilters)} >
            {clearAll}
          </span>
        </div>
      )

    }
    return null
  }

  removeActiveFilter = (key, value) => {
    const {updateActiveFilters} = this.props
    const activeFilters = _.cloneDeep(this.props.activeFilters||{})
    let activeSet = activeFilters[key]
    if (!activeSet) {
      activeSet = activeFilters[key] = new Set()
    }
    activeSet.delete(value)
    updateActiveFilters(activeFilters)
  }

  handleClearClick = (clearFilters) => {
    this.removeAllActiveFilter(clearFilters)
  }

  handleClearKeyPress(e, clearFilters) {
    if ( e.key === 'Enter') {
      this.removeAllActiveFilter(clearFilters)
    }
  }

  removeAllActiveFilter = (clearFilters) => {
    const {updateActiveFilters, location, history } = this.props
    const activeFilters = _.cloneDeep(this.props.activeFilters||{})
    clearFilters.forEach(key=> {
      let activeSet = activeFilters[key]
      if (!activeSet) {
        activeSet = activeFilters[key] = new Set()
      }
      activeSet.clear()
    })
    updateActiveFilters(activeFilters)
    //update current url after removing all active filters
    //text search input filter will not be removed, which is controled by itself
    const paraURL = {}
    let op = ''
    const curentURL = queryString.parse(location.search)
    if(curentURL.index) {
      paraURL.index = curentURL.index
      op = '?'
    }
    if(curentURL.filters) {
      paraURL.filters = curentURL.filters
      op = '?'
    }
    history.push(`${location.pathname}${op}${queryString.stringify(paraURL)}`)
  }
}

ResourceFilterBar.propTypes = {
  activeFilters: PropTypes.object,
  history: PropTypes.object.isRequired,
  location: PropTypes.object,
  updateActiveFilters: PropTypes.func,
}


const mapStateToProps = (state) => {
  const {resourceToolbar: {activeFilters}} = state
  return { activeFilters }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateActiveFilters: (activeFilters) => dispatch(updateActiveFilters(activeFilters))
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ResourceFilterBar))
