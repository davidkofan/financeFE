import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import VCalendar from 'v-calendar'
import 'v-calendar/style.css'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'

import {  BAccordion, BAccordionItem, BImg, BCarousel, BCarouselSlide, BTab, BTabs, BFormFile, BNav, BNavItem, BCol, BRow, BDropdown, BDropdownItem, BCollapse, BTable, BTh, BTr, BTd, BSpinner, BBadge, BCard, BCardImg, BCardHeader, BCardBody, BCardText, BCardGroup, BForm, BFormGroup, BFormInput, BFormSelect, BFormCheckbox, BButton, BButtonGroup, BFormTextarea, BModal, BOffcanvas, BAlert } from 'bootstrap-vue-next'
const app = createApp(App)

import { createBootstrap } from 'bootstrap-vue-next/plugins/createBootstrap';

app.use(createBootstrap());

app.use(createPinia())
app.use(VCalendar, {})
app.use(router)

app.component('BAccordion', BAccordion)
app.component('BAccordionItem', BAccordionItem)
app.component('BImg', BImg)
app.component('BCarousel', BCarousel)
app.component('BCarouselSlide', BCarouselSlide)
app.component('BTab', BTab)
app.component('BTabs', BTabs)
app.component('BFormFile', BFormFile)
app.component('BNav', BNav)
app.component('BNavItem', BNavItem)
app.component('BCol', BCol)
app.component('BRow', BRow)
app.component('BDropdown', BDropdown)
app.component('BDropdownItem', BDropdownItem)
app.component('BCollapse', BCollapse)
app.component('BTable', BTable)
app.component('BTh', BTh)
app.component('BTr', BTr)
app.component('BTd', BTd)
app.component('BSpinner', BSpinner)
app.component('BBadge', BBadge)
app.component('BCard', BCard)
app.component('BCardImg', BCardImg)
app.component('BCardHeader', BCardHeader)
app.component('BCardBody', BCardBody)
app.component('BCardText', BCardText)
app.component('BCardGroup', BCardGroup)
app.component('BForm', BForm)
app.component('BFormGroup', BFormGroup)
app.component('BFormInput', BFormInput)
app.component('BFormSelect', BFormSelect)
app.component('BFormCheckbox', BFormCheckbox)
app.component('BButton', BButton)
app.component('BButtonGroup', BButtonGroup)
app.component('BModal', BModal)
app.component('BOffcanvas', BOffcanvas)
app.component('BFormTextarea', BFormTextarea)
app.component('BAlert', BAlert)

app.mount('#app')
