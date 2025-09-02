let toolUI = `
    <div id='overlay-announcement' aria-live='assertive' aria-atomic='true' aria-relevant='additions'>
        <span class='announce'></span>
    </div>
    <div class="frame positionTopRight b-r-Right" id="overlay-icon" role="button" tabindex="0" aria-haspopup="dialog" aria-label="Accessibility settings">
        <img class="vector" src='../images/vector.svg' draggable="false" alt=''/><span class="fa fa-close" draggable="false" style='display:none !important;'></span>
        <img class="img" src="../images/vector-1.svg" draggable="false" alt=''/>
    </div>

    <div class="frame overlay-popup popupPositionTopRight" id="overlay-popup" role="dialog" aria-modal="true" aria-labelledby="dialog-title"
        style="display:none">
        <div class="overlap">
            <img class="polygon" src="../images/polygon-1.svg" alt="" style="display:none"/>
            <div class="div">
                <div class="div-2">
                    <div class="div-3">
                        <div class="div-4">
                            <div class="div-5">
                                <img class="body" src="../images/body-3.svg" alt="" />
                                <div class="text-wrapper" id="dialog-title">Enhance Accessibility</div>
                            </div>
                            <div class="div-6" role="button" tabindex="0" id="revert-all">
                                <div class="link" aria-hidden="true"></div>
                                <div class="link-wrapper">
                                    <div class="link-2">Revert All</div>
                                </div>
                            </div>
                        </div>
                        <div class="right-nest" role="button" tabindex="0" id="close-popup" aria-label="Close">
                            <div class="close-icon">
                                <div class="close-icon-2" aria-hidden="true"></div>
                                <span class="visually-hidden">Close</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="div-7">
                    <div class="div-8" id="ccEnhancer" role="group" aria-labelledby="contrastGroup">
                        <div class="div-9">
                            <img class="img" src="../images/colors-1.svg" />
                            <div class="text-wrapper-2" id="contrastGroup">
                                Color Contrast
                            </div>
                        </div>
                        <div class="div-10">
                            <div class="div-11" role="button" tabindex="0" id="blackOnWhite" aria-pressed="false">
                                <div class="div-wrapper whiteBg">
                                    <div class="text-wrapper-3 blackText" aria-hidden="true">B/W</div>
                                </div>
                                <div class="div-wrapper-2">
                                    <div class="text-wrapper-4">Black / White</div>
                                </div>
                            </div>
                            <div class="div-11" role="button" tabindex="0" id="whiteOnBlack" aria-pressed="false">
                                <div class="div-wrapper-3 blackBg">
                                    <div class="text-wrapper-5 whiteText" aria-hidden="true">W/B</div>
                                </div>
                                <div class="div-wrapper-2">
                                    <div class="text-wrapper-4">White / Black</div>
                                </div>
                            </div>
                        </div>
                        <div class="div-10">
                            <div class="div-11" role="button" tabindex="0" id="yellowOnBlack" aria-pressed="false">
                                <div class="div-wrapper-4 blackBg">
                                    <div class="text-wrapper-5 yellowText" aria-hidden="true">Y/B</div>
                                </div>
                                <div class="div-wrapper-2">
                                    <div class="text-wrapper-4">Yellow / Black</div>
                                </div>
                            </div>
                            <div class="div-11" role="button" tabindex="0" id="blackOnYellow" aria-pressed="false">
                                <div class="div-wrapper yellowBg">
                                    <div class="b-w blackText" aria-hidden="true">B/Y</div>
                                </div>
                                <div class="div-wrapper-2">
                                    <div class="text-wrapper-4">Black / Yellow</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="div-8" id="highlightLinks" role="group" aria-labelledby="highlightLinkGroup">
                        <div class="highlight-link-head-wrapper">
                            <div class="close-icon" aria-hidden="true"></div>
                            <div class="text-wrapper" id="highlightLinkGroup">Highlight Links & Buttons</div>
                        </div>
                        <div class="highlight-link-switch-wrapper">
                            <div class="highlight-link-switch" id="highlightLinkSwitch" role="switch" tabindex="0" aria-label="Highlight Links & Buttons" aria-checked="false">
                                <div class="status-container">
                                    <div class="status-container-2"><div class="text-wrapper-2">Off</div></div>
                                </div>
                                <div class="switch-text-wrapper"><div class="text-magnifier">Highlight Links & Buttons</div></div>
                            </div>
                        </div>
                    </div>
                    <div class="div-8" id="fontStyle" role="group" aria-labelledby="fontStyleGroup">
                        <div class="div-12">
                            <img class="img" src="../images/font-size-1-1.svg" alt="" />
                            <div class="text-wrapper-2" id="fontStyleGroup">
                                Font Style
                            </div>
                            <div class="view-type revertFontStyle" role="button" tabindex='0' aria-label='Revert Font Style to Default'>
                                <div class="revertIcon"></div>
                                <span class="sr-only">Revert Font Styles</span>
                            </div>
                        </div>
                        <div class="div-13">
                            <div class="div-14">
                                <div class="input" id="fontStyleCombobox" tabindex="0" role="combobox"
                                    aria-haspopup="listbox" aria-controls="fontStyleList" aria-expanded="false"
                                    aria-labelledby="fontStyleGroup" aria-activedescendant="">
                                    <div class="content">
                                        <div class="text">Arial</div>
                                        <div class="text-wrapper-6" aria-hidden="true"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="listbox" role="listbox" tabindex="-1" id="fontStyleList" aria-labelledby="fontStyleGroup">
                                <div class="component" tabindex="-1" role="option" id="font-1" aria-selected="false">
                                    <div class="export-as-excel fontArial">Arial</div>
                                </div>
                                <div class="component-2" tabindex="-1" role="option" id="font-2" aria-selected="false">
                                    <div class="export-as-excel fontCalibri">Calibri</div>
                                </div>
                                <div class="component-2" tabindex="-1" role="option" id="font-3" aria-selected="false">
                                    <div class="export-as-excel fontVerdana">Verdana</div>
                                </div>
                                <div class="component-2" tabindex="-1" role="option" id="font-4" aria-selected="false">
                                    <div class="export-as-excel fontTahoma">Tahoma</div>
                                </div>
                                <div class="component-2" tabindex="-1" role="option" id="font-5" aria-selected="false">
                                    <div class="export-as-excel fontComicSans">Comic Sans</div>
                                </div>
                                <div class="component-2" tabindex="-1" role="option" id="font-6" aria-selected="false">
                                    <div class="export-as-excel fontCenturyGothic">Century Gothic</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="div-8" id="fontSize" role="group" aria-labelledby="fontSizeGroup">
                        <div class="div-9">
                            <img class="img" src="../images/type-2-1.svg" alt="" />
                            <div class="text-wrapper-2" id="fontSizeGroup">
                                Font Size Adjustment
                            </div>
                            <div class="view-type revertFontSize" role="button" tabindex='0' aria-label='Revert Font Size to Default'>
                                <div class="revertIcon"></div>
                                <span class="sr-only">Revert Font Sizes</span>
                            </div>
                        </div>
                        <div class="div-10">
                            <div class="div-15">
                                <div class="div-16">
                                    <div class="div-wrapper-5" id="fontDecrease" tabindex="0" role="button" aria-label="Decrease font size">
                                        <div class="text-wrapper-8" aria-hidden="true"></div>
                                    </div>
                                    <div class="overlap-group">
                                        <div class="div-17"></div>
                                        <div class="group">
                                            <div class="element-wrapper" tabindex="0" id="fontSlider" role="slider" aria-labelledby="fontSizeGroup" aria-valumin="12" aria-valuemax="30" aria-valuenow="12" aria-valuetext="12pt">
                                                <p class="element" id="sliderSizeDetails">
                                                    <span class="span">12</span>
                                                    <span class="text-wrapper-7">pt</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="div-wrapper-6" id="fontIncrease" tabindex="0" role="button" aria-label="Increase font size">
                                        <div class="text-wrapper-8" aria-hidden="true"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="div-10">
                        <div class="div-18" id="textMagnifier" role="group" aria-labelledby="magnifierGroup"
                            style="display:none">
                            <div class="div-12">
                                <img class="img" src="../images/zoom-in-1.svg" alt="" />
                                <div class="text-wrapper-2" id="magnifierGroup">
                                    Text Magnifier
                                </div>
                            </div>
                            <div class="frame-wrapper">
                                <div class="div-15" role="button" tabindex="0">
                                    <div class="frame-wrapper-2">
                                        <div class="div-wrapper-7">
                                            <div class="text-wrapper-9">Off</div>
                                        </div>
                                    </div>
                                    <div class="div-wrapper-7">
                                        <div class="text-wrapper-10">Text Magnifier</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="div-18" id="focusVisibility" role="group" aria-labelledby="focusVisibilityGroup">
                            <div class="div-12">
                                <img class="img" src="../images/eye-1.svg" alt="" />
                                <div class="text-wrapper-2" id="focusVisibilityGroup">
                                    Focus Visibility
                                </div>
                            </div>
                            <div class="frame-wrapper">
                                <div class="div-15" id="focusVisiblityToggle" role="switch" tabindex="0" aria-checked="false">
                                    <div class="frame-wrapper-2">
                                        <div class="div-wrapper-7">
                                            <div class="text-wrapper-9" id="visibilityStatus">Off</div>
                                        </div>
                                    </div>
                                    <div class="div-wrapper-7">
                                        <div class="text-wrapper-10">Focus Visibility</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="div-8" id="textAlignment" role="group" aria-labelledby="textAlignmentGroup">
                        <div class="div-9">
                            <img class="img" src="../images/font-1.svg" alt="" />
                            <div class="text-wrapper-2" id="textAlignmentGroup">
                                Font Alignment
                            </div>
                        </div>
                        <div class="div-19">
                            <div class="div-20" id="textLeft" role="button" tabindex="0" aria-pressed="false">
                                <div class="frame-wrapper-3">
                                    <div class="div-wrapper-7">
                                        <div class="l" aria-hidden="true"></div>
                                    </div>
                                </div>
                                <div class="large-wrapper">
                                    <div class="text-wrapper-10">Align Left</div>
                                </div>
                            </div>
                            <div class="div-20" id="textCenter" role="button" tabindex="0" aria-pressed="false">
                                <div class="frame-wrapper-3">
                                    <div class="div-wrapper-7">
                                        <div class="l" aria-hidden="true"></div>
                                    </div>
                                </div>
                                <div class="large-wrapper">
                                    <div class="text-wrapper-10">Align Center</div>
                                </div>
                            </div>
                            <div class="div-20" id="textRight" role="button" tabindex="0" aria-pressed="false">
                                <div class="frame-wrapper-3">
                                    <div class="div-wrapper-7">
                                        <div class="l" aria-hidden="true"></div>
                                    </div>
                                </div>
                                <div class="large-wrapper">
                                    <div class="text-wrapper-10">Align Right</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="context-menu-container">
        <ul class="context-menu" role="menu" aria-label="Accessibility Enhancer Settings">
            <li role="none" class="move-setting">
                <a href="#" class="move-menu" role="menuitem" aria-haspopup="menu" aria-controls="move-menu">Move</a>
                <ul role="menu" class="context-sub-menu" id="move-menu">
                    <li role="none">
                        <a href="#" role="menuitem" class="btn_menu">Top-Right</a>
                    </li>
                    <li role="none">
                        <a href="#" role="menuitem" class="btn_menu">Bottom-Right</a>
                    </li>
                    <li role="none">
                        <a href="#" role="menuitem" class="btn_menu">Top-Left</a>
                    </li>
                    <li role="none">
                        <a href="#" role="menuitem" class="btn_menu">Bottom-Left</a>
                    </li>
                </ul>
            </li>
            <!--li role="none">
                <a href="#" role="menuitem">Hide Menu</a>
            </li>
            <li role="none">
                <a href="#" role="menuitem">Exit</a>
            </li-->
        </ul>
    </div>`;

export default toolUI;
