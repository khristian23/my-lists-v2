import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, RenderResult, cleanup } from '@testing-library/vue';
import { Quasar } from 'quasar';
import TheMenuLink from '@/components/TheMenuLink.vue';
import ThePageLayoutTest from './helpers/ThePageLayoutTest.vue';
import { createRouter, createWebHistory } from 'vue-router';

interface TheMenuLinkProps {
  title: string;
  caption?: string;
  link?: string;
  icon?: string;
}

describe('The Menu Link', () => {
  const title = 'A custom title';
  const caption = 'A custom caption';
  const icon = 'delete';
  const route = 'some-route';

  const router = createRouter({
    history: createWebHistory(),
    routes: [
      {
        name: route,
        component: ThePageLayoutTest,
        path: '/',
      },
    ],
  });

  function renderTheMenuLink(props: TheMenuLinkProps): RenderResult {
    return render(TheMenuLink, {
      props: props,
      global: {
        plugins: [Quasar, router],
      },
    });
  }

  afterEach(() => cleanup());

  it('should render a link with title', () => {
    renderTheMenuLink({ title });
    expect(screen.getByText(title)).toBeTruthy();
  });

  it('should render the caption', () => {
    renderTheMenuLink({
      title,
      caption,
    });

    expect(screen.getByText(caption)).toBeTruthy();
  });

  it('should render an icon', () => {
    renderTheMenuLink({ title, icon });

    expect(screen.getByText(icon)).toBeTruthy();
  });

  it('should render the a link', () => {
    const { container } = renderTheMenuLink({ title, link: '/' });

    const anchor = container.querySelector('a[href="/"]');

    expect(anchor).toBeTruthy();
  });
});
