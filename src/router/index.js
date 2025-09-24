import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/components/login/LoginComponent.vue';

//board
import Board from '@/components/board/BoardComponent.vue';
import BoardAccountGroups from '@/components/board/accountsBalance/AccountGroupsComponent.vue';
import BoardBusinessFinances from '@/components/board/businessFinances/BusinessFinancesComponent.vue';
import BoardExpensesAndIncome from '@/components/board/expensesAndIncome/ExpensesAndIncomeComponent.vue';


//admin
import Admin from '@/components/admin/AdminComponent.vue';

//admin - accounts balance
import AdminAccountGroups from '@/components/admin/accountsBalance/AccountGroupsComponent.vue';
import AdminAccountGroupDetail from '@/components/admin/accountsBalance/AccountGroupDetailComponent.vue';

//admin - business finances
import AdminBusinessFinances from '@/components/admin/businessFinances/BusinessFinancesComponent.vue';
import AdminFiscalYearDetail from '@/components/admin/businessFinances/FiscalYearDetailComponent.vue';

//admin - expenses and income
import AdminExpensesAndIncome from '@/components/admin/expensesAndIncome/ExpensesAndIncomeComponent.vue';
import AdminExpenseGroupDetail from '@/components/admin/expensesAndIncome/ExpensesGroupdetailComponent.vue';
import AdminIncomesGroupDetail from '@/components/admin/expensesAndIncome/IncomesGroupdetailComponent.vue';

//admin - import/export
import AdminImportExport from '@/components/admin/importExport/ImportExportComponent.vue';

const routes = [
  {
    path: '',
    redirect: '/board'
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
  },
  {
    path: '/board',
    component: Board,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: 'board/accountGroups'
      },
      {
        path: 'accountGroups',
        component: BoardAccountGroups
      },
      {
        path: 'business',
        component: BoardBusinessFinances
      },
      {
        path: 'expensesAndIncome',
        component: BoardExpensesAndIncome
      },
    ]
  },
  {
    path: '/admin',
    component: Admin,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: 'admin/accountGroups'
      },
      {
        path: 'accountGroups',
        component: AdminAccountGroups,
      },
      {
        path: 'accountGroups/detail/:id',
        name: 'accountsGroupDetail',
        component: AdminAccountGroupDetail
      },
      {
        path: 'business',
        component: AdminBusinessFinances
      },
      {
        path: 'business/fiscalYear/detail/:id',
        name: 'fiscalYearDetail',
        component: AdminFiscalYearDetail
      },
      {
        path: 'expensesAndIncome',
        component: AdminExpensesAndIncome
      },
      {
        path: 'expensesGroup/detail/:id',
        name: 'expensesGroupDetail',
        component: AdminExpenseGroupDetail
      },
      {
        path: 'incomesGroup/detail/:id',
        name: 'incomesGroupDetail',
        component: AdminIncomesGroupDetail
      },
      {
        path: 'import-export',
        component: AdminImportExport
      },
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const token = localStorage.getItem('userToken');

  if (requiresAuth && !token) {
    next({ name: 'login' });
  } else {
    next();
  }
});

export default router;
