export default () => {
  const els = document.getElementsByTagName('meta');
  for (let i = 0; i < els.length; i++) {
    if (els[i].getAttribute('name') === 'csrf-token') {
      return els[i].getAttribute('content');
    }
  }

  return null;
};
