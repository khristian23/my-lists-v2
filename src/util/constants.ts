export default {
  user: {
    anonymous: 'Anonymous',
  },

  events: {
    showError: 'show-error',
    showToast: 'show-toast',
  },

  listType: {
    toDoList: 'todo',
    shoppingCart: 'shop',
    whishlist: 'wish',
    checklist: 'checklist',
    note: 'note',
  },

  lists: {
    priority: {
      lowest: 999,
      hightest: 0,
    },
    types: [
      {
        type: 'List',
        value: 'todo',
        label: 'To Do List',
        icon: 'list',
        subTypes: [
          {
            value: 'personal',
            label: 'Personal',
          },
          {
            value: 'work',
            label: 'Work',
          },
        ],
      },
      {
        type: 'List',
        value: 'shop',
        label: 'Shopping List',
        icon: 'shopping_cart',
        subTypes: [
          {
            value: 'groceries',
            label: 'Groceries',
          },
          {
            value: 'house',
            label: 'House',
          },
        ],
      },
      {
        type: 'List',
        value: 'wish',
        label: 'Whishlist',
        icon: 'star_rate',
        subTypes: [],
      },
      {
        type: 'List',
        value: 'check',
        label: 'Checklist',
        icon: 'library_add_check',
        subTypes: [
          {
            value: 'personal',
            label: 'Personal',
          },
          {
            value: 'work',
            label: 'Work',
          },
        ],
      },
      {
        type: 'Note',
        value: 'note',
        label: 'Note',
        icon: 'description',
        subTypes: [],
      },
    ],
  },

  itemStatus: {
    done: 'Done',
    pending: 'Pending',
  },

  changeStatus: {
    none: '',
    new: 'N',
    changed: 'C',
    deleted: 'D',
  },

  routes: {
    lists: {
      name: 'lists',
      path: '',
    },
    list: 'list',
    listItems: 'list-items',
    listItem: 'list-item',
    checklist: 'checklist',
    note: 'note',
    login: {
      name: 'login',
      path: '/login',
    },
    register: {
      name: 'register',
      path: '/register',
    },
    profile: {
      name: 'profile',
      path: '/profile',
    },
    camera: {
      name: 'profile-picture',
      path: '/profile-picture',
    },
  },

  itemActionIcon: {
    edit: 'edit',
    delete: 'delete',
    done: 'done',
  },
};
