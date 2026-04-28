const transactionService = {

  // busca
  findByUser: user => {
    return firebase.firestore()
      .collection('transactions')
      .where('user.uid', '==', user.uid)
      .orderBy('date', 'desc')
      .get()
      .then(snapshot => snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id })));
  },

  findById: uid => {
    return firebase.firestore()
      .collection('transactions')
      .doc(uid)
      .get()
      .then(doc => doc.data());
  },

  // ações
  remove: transaction => {
    return firebase.firestore()
      .collection('transactions')
      .doc(transaction.uid)
      .delete();
  },

  save: transaction => {
    return firebase.firestore()
      .collection('transactions')
      .add(transaction);
  },

  update: transaction => {
    return firebase.firestore()
      .collection('transactions')
      .doc(transaction.uid)
      .update(transaction);
  }

};