# 🍔 Menú Hamburguesa - Documentación

## ✨ Características

El menú hamburguesa implementado incluye:

- **Sidebar Deslizable**: Transform translateX desde -100% a 0
- **Animación del Ícono**: Tres líneas que se transforman en X
- **Overlay con Blur**: Fondo oscuro con backdrop-filter blur
- **Animaciones Escalonadas**: Links aparecen con delay progresivo
- **Prevención de Scroll**: Body bloqueado cuando el menú está abierto
- **Responsive**: Solo visible en mobile (<768px)

## 🎨 Estilos Aplicados

### Botón Hamburguesa
```css
- Transform 3 líneas → X animado
- Cubic-bezier para animación suave
- Z-index 150 para estar encima
```

### Sidebar
```css
- Width: 85% (max 320px)
- Transform: translateX(-100%) → translateX(0)
- Glassmorphism: backdrop-blur(40px)
- Transición: 0.4s cubic-bezier
```

### Overlay
```css
- Background: rgba(0,0,0,0.8)
- Backdrop-filter: blur(8px)
- Opacity: 0 → 1
- Z-index: 140
```

## 🚀 Uso

El componente `MobileNav` se importa en el landing page:

```tsx
import { MobileNav } from "@/components/layout/MobileNav";

// En el header
<nav className="landing-menu">
  {/* Desktop menu */}
</nav>
<MobileNav /> {/* Mobile menu */}
```

## 📱 Comportamiento

1. **Click en Hamburguesa**: Abre el sidebar con animación
2. **Click en Overlay**: Cierra el menú
3. **Click en Link**: Cierra el menú automáticamente
4. **Click en Close (✕)**: Cierra el menú
5. **Navegación**: Smooth scroll para anchors (#features)

## 🎯 Links Incluidos

- **Características** (#features) - Con ícono ✨
- **Divider**
- **Iniciar Sesión** (/auth/login) - Con ícono 🔑
- **Comenzar Gratis** (/auth/register) - CTA primario con ícono 🚀

## 🎨 Personalización

### Cambiar Ancho del Sidebar
```css
.mobile-nav-sidebar {
  max-width: 320px; /* Ajustar aquí */
}
```

### Cambiar Velocidad de Animación
```css
.mobile-nav-sidebar {
  transition: transform 0.4s; /* Ajustar duración */
}
```

### Cambiar Intensidad del Blur
```css
.mobile-nav-overlay {
  backdrop-filter: blur(8px); /* Ajustar blur */
}
```

## ✅ Verificación

Build exitoso:
```
✓ TypeScript compilation
✓ Next.js build
✓ 17 páginas generadas
```

## 🔄 Mejoras Futuras Sugeridas

1. **Gestos Táctiles**: Swipe para cerrar
2. **Temas**: Dark/Light mode toggle
3. **Búsqueda**: Input de búsqueda rápida
4. **Idiomas**: Selector de idioma
5. **Submenu**: Dropdowns para más opciones
